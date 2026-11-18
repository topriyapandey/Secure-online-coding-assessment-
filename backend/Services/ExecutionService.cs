using Microsoft.EntityFrameworkCore;
using CodingAssessment.Api.Data;
using CodingAssessment.Api.DTOs;
using CodingAssessment.Api.Models;

namespace CodingAssessment.Api.Services
{
    public interface IExecutionService
    {
        Task<RunCodeResponseDto> RunSampleCodeAsync(RunCodeRequestDto dto);
        Task<(bool Success, string Message, SubmitCodeResponseDto? Result)> SubmitSolutionAsync(SubmitCodeRequestDto dto, string candidateId);
    }

    public class ExecutionService : IExecutionService
    {
        private readonly ApplicationDbContext _context;
        private readonly IJudge0Service _judge0Service;
        private readonly IAssessmentAttemptService _attemptService;
        private readonly ILogger<ExecutionService> _logger;

        public ExecutionService(
            ApplicationDbContext context,
            IJudge0Service judge0Service,
            IAssessmentAttemptService attemptService,
            ILogger<ExecutionService> logger)
        {
            _context = context;
            _judge0Service = judge0Service;
            _attemptService = attemptService;
            _logger = logger;
        }

        public async Task<RunCodeResponseDto> RunSampleCodeAsync(RunCodeRequestDto dto)
        {
            var question = await _context.Questions.FindAsync(dto.QuestionId);
            if (question == null)
            {
                return new RunCodeResponseDto
                {
                    Status = "Error",
                    ErrorMessage = "Question not found."
                };
            }

            var inputToRun = dto.CustomInput ?? question.SampleInput;
            var expectedOutput = string.IsNullOrEmpty(dto.CustomInput) ? question.SampleExpectedOutput : null;

            var execution = await _judge0Service.ExecuteAsync(
                dto.SourceCode,
                dto.Language,
                inputToRun,
                expectedOutput);

            return new RunCodeResponseDto
            {
                Status = execution.Status,
                StandardOutput = execution.Output,
                ErrorMessage = execution.ErrorMessage,
                CompileOutput = execution.CompileOutput,
                ExecutionTimeMs = execution.ExecutionTimeMs,
                MemoryKb = execution.MemoryKb,
                Passed = execution.Passed,
                ExpectedOutput = expectedOutput
            };
        }

        public async Task<(bool Success, string Message, SubmitCodeResponseDto? Result)> SubmitSolutionAsync(
            SubmitCodeRequestDto dto,
            string candidateId)
        {
            // Verify attempt is active and not timed out on server
            var isAttemptValid = await _attemptService.IsAttemptActiveAndValidAsync(dto.AssessmentAttemptId, candidateId);
            if (!isAttemptValid)
            {
                return (false, "Cannot submit solution: Assessment attempt is not active or time has expired.", null);
            }

            var question = await _context.Questions
                .Include(q => q.TestCases)
                .FirstOrDefaultAsync(q => q.Id == dto.QuestionId);

            if (question == null)
            {
                return (false, "Question not found.", null);
            }

            if (!question.TestCases.Any())
            {
                return (false, "Question has no test cases configured.", null);
            }

            var testCases = question.TestCases.ToList();
            var testCaseResults = new List<TestCaseResultDetailDto>();
            var submissionResultEntities = new List<SubmissionResult>();

            int passedCount = 0;
            double totalWeight = testCases.Sum(tc => tc.Weight > 0 ? tc.Weight : 1);
            double earnedWeight = 0;
            string overallStatus = "Accepted";
            string? firstCompileError = null;
            double maxExecutionTime = 0;
            double maxMemory = 0;

            for (int i = 0; i < testCases.Count; i++)
            {
                var tc = testCases[i];
                var exec = await _judge0Service.ExecuteAsync(
                    dto.SourceCode,
                    dto.Language,
                    tc.Input,
                    tc.ExpectedOutput);

                if (exec.ExecutionTimeMs.HasValue && exec.ExecutionTimeMs > maxExecutionTime)
                {
                    maxExecutionTime = exec.ExecutionTimeMs.Value;
                }
                if (exec.MemoryKb.HasValue && exec.MemoryKb > maxMemory)
                {
                    maxMemory = exec.MemoryKb.Value;
                }

                if (exec.Passed)
                {
                    passedCount++;
                    earnedWeight += (tc.Weight > 0 ? tc.Weight : 1);
                }
                else
                {
                    // Update overall status prioritization: Compilation Error > Runtime Error > Time Limit Exceeded > Wrong Answer
                    if (exec.Status == "Compilation Error")
                    {
                        overallStatus = "Compilation Error";
                        firstCompileError ??= exec.CompileOutput ?? exec.ErrorMessage;
                    }
                    else if (exec.Status == "Time Limit Exceeded" && overallStatus != "Compilation Error")
                    {
                        overallStatus = "Time Limit Exceeded";
                    }
                    else if (exec.Status == "Runtime Error" && overallStatus != "Compilation Error")
                    {
                        overallStatus = "Runtime Error";
                    }
                    else if (overallStatus == "Accepted")
                    {
                        overallStatus = "Wrong Answer";
                    }
                }

                // Create client detail (mask hidden test cases for security)
                var detail = new TestCaseResultDetailDto
                {
                    TestCaseNumber = i + 1,
                    IsHidden = tc.IsHidden,
                    Passed = exec.Passed,
                    Status = exec.Status,
                    Input = tc.IsHidden ? null : tc.Input,
                    ExpectedOutput = tc.IsHidden ? null : tc.ExpectedOutput,
                    ActualOutput = tc.IsHidden ? null : exec.Output,
                    ErrorMessage = exec.ErrorMessage,
                    ExecutionTime = exec.ExecutionTimeMs
                };
                testCaseResults.Add(detail);

                // Create entity record
                submissionResultEntities.Add(new SubmissionResult
                {
                    TestCaseId = tc.Id,
                    Passed = exec.Passed,
                    ActualOutput = exec.Output,
                    ExecutionTime = exec.ExecutionTimeMs,
                    Memory = exec.MemoryKb,
                    StatusDescription = exec.Status,
                    ErrorMessage = exec.ErrorMessage
                });

                // If compilation error occurs on first test case, no need to run remaining test cases
                if (exec.Status == "Compilation Error")
                {
                    firstCompileError ??= exec.CompileOutput ?? exec.ErrorMessage;
                    break;
                }
            }

            // Calculate marks
            int marksObtained = 0;
            if (overallStatus != "Compilation Error" && totalWeight > 0)
            {
                marksObtained = (int)Math.Round((earnedWeight / totalWeight) * question.Marks);
            }

            // Map string status to enum
            var statusEnum = overallStatus switch
            {
                "Accepted" => SubmissionStatus.Accepted,
                "Wrong Answer" => SubmissionStatus.WrongAnswer,
                "Compilation Error" => SubmissionStatus.CompilationError,
                "Runtime Error" => SubmissionStatus.RuntimeError,
                "Time Limit Exceeded" => SubmissionStatus.TimeLimitExceeded,
                _ => SubmissionStatus.WrongAnswer
            };

            var submission = new Submission
            {
                AssessmentAttemptId = dto.AssessmentAttemptId,
                QuestionId = dto.QuestionId,
                CandidateId = candidateId,
                SourceCode = dto.SourceCode,
                Language = dto.Language,
                SubmittedAt = DateTime.UtcNow,
                Status = statusEnum,
                PassedTestCases = passedCount,
                TotalTestCases = testCases.Count,
                MarksObtained = marksObtained,
                ExecutionTimeMs = maxExecutionTime,
                MemoryKb = maxMemory,
                CompileOutput = firstCompileError,
                TestResults = submissionResultEntities
            };

            _context.Submissions.Add(submission);

            // Update draft code with submitted code
            var draft = await _context.DraftCodes
                .FirstOrDefaultAsync(d => d.AssessmentAttemptId == dto.AssessmentAttemptId && d.QuestionId == dto.QuestionId);

            if (draft != null)
            {
                draft.Code = dto.SourceCode;
                draft.Language = dto.Language;
                draft.LastSavedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            var response = new SubmitCodeResponseDto
            {
                SubmissionId = submission.Id,
                Status = overallStatus,
                PassedTestCases = passedCount,
                TotalTestCases = testCases.Count,
                MarksObtained = marksObtained,
                MaxMarks = question.Marks,
                ExecutionTimeMs = maxExecutionTime,
                MemoryKb = maxMemory,
                CompileOutput = firstCompileError,
                TestCaseResults = testCaseResults
            };

            return (true, "Solution submitted and evaluated successfully.", response);
        }
    }
}
