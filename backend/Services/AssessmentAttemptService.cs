using Microsoft.EntityFrameworkCore;
using CodingAssessment.Api.Data;
using CodingAssessment.Api.DTOs;
using CodingAssessment.Api.Models;

namespace CodingAssessment.Api.Services
{
    public interface IAssessmentAttemptService
    {
        Task<(bool Success, string Message, AssessmentAttemptDto? Data)> StartAttemptAsync(int assessmentId, string candidateId);
        Task<AssessmentAttemptDto?> GetAttemptStatusAsync(int attemptId, string candidateId);
        Task<(bool Success, string Message)> SaveDraftAsync(SaveDraftRequestDto dto, string candidateId);
        Task<(bool Success, string Message, int FinalScore)> FinalizeAttemptSubmissionAsync(int attemptId, string candidateId);
        Task<bool> IsAttemptActiveAndValidAsync(int attemptId, string candidateId);
    }

    public class AssessmentAttemptService : IAssessmentAttemptService
    {
        private readonly ApplicationDbContext _context;

        public AssessmentAttemptService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(bool Success, string Message, AssessmentAttemptDto? Data)> StartAttemptAsync(int assessmentId, string candidateId)
        {
            var now = DateTime.UtcNow;

            var assessment = await _context.Assessments
                .Include(a => a.Questions)
                    .ThenInclude(q => q.TestCases.Where(tc => !tc.IsHidden))
                .FirstOrDefaultAsync(a => a.Id == assessmentId);

            if (assessment == null)
            {
                return (false, "Assessment not found.", null);
            }

            if (!assessment.IsPublished)
            {
                return (false, "Assessment is not published.", null);
            }

            if (now < assessment.StartTime)
            {
                return (false, $"Assessment has not started yet. Starts at {assessment.StartTime:u}.", null);
            }

            if (now > assessment.EndTime)
            {
                return (false, "Assessment window has expired.", null);
            }

            // Check existing attempt
            var existingAttempt = await _context.AssessmentAttempts
                .Include(at => at.DraftCodes)
                .Include(at => at.Submissions)
                .FirstOrDefaultAsync(at => at.AssessmentId == assessmentId && at.CandidateId == candidateId);

            if (existingAttempt != null)
            {
                // If already submitted or timed out
                if (existingAttempt.Status != AttemptStatus.InProgress)
                {
                    return (false, $"You have already completed this assessment (Status: {existingAttempt.Status}).", null);
                }

                // If expired based on deadline
                if (now > existingAttempt.Deadline)
                {
                    existingAttempt.Status = AttemptStatus.TimedOut;
                    await _context.SaveChangesAsync();
                    return (false, "Your time for this assessment has expired.", null);
                }

                // Return existing active attempt
                var activeDto = MapToAttemptDto(existingAttempt, assessment, now);
                return (true, "Resumed active assessment attempt.", activeDto);
            }

            // Calculate deadline strictly on server side
            var durationDeadline = now.AddMinutes(assessment.DurationMinutes);
            var effectiveDeadline = durationDeadline < assessment.EndTime ? durationDeadline : assessment.EndTime;

            var newAttempt = new AssessmentAttempt
            {
                AssessmentId = assessmentId,
                CandidateId = candidateId,
                StartedAt = now,
                Deadline = effectiveDeadline,
                Status = AttemptStatus.InProgress,
                TotalScore = 0
            };

            _context.AssessmentAttempts.Add(newAttempt);
            await _context.SaveChangesAsync();

            var resultDto = MapToAttemptDto(newAttempt, assessment, now);
            return (true, "Assessment started successfully.", resultDto);
        }

        public async Task<AssessmentAttemptDto?> GetAttemptStatusAsync(int attemptId, string candidateId)
        {
            var now = DateTime.UtcNow;

            var attempt = await _context.AssessmentAttempts
                .Include(at => at.Assessment)
                    .ThenInclude(a => a!.Questions)
                        .ThenInclude(q => q.TestCases.Where(tc => !tc.IsHidden))
                .Include(at => at.DraftCodes)
                .Include(at => at.Submissions)
                .FirstOrDefaultAsync(at => at.Id == attemptId && at.CandidateId == candidateId);

            if (attempt == null || attempt.Assessment == null) return null;

            // Check if deadline passed
            if (attempt.Status == AttemptStatus.InProgress && now > attempt.Deadline)
            {
                attempt.Status = AttemptStatus.TimedOut;
                await _context.SaveChangesAsync();
            }

            return MapToAttemptDto(attempt, attempt.Assessment, now);
        }

        public async Task<(bool Success, string Message)> SaveDraftAsync(SaveDraftRequestDto dto, string candidateId)
        {
            var now = DateTime.UtcNow;
            var attempt = await _context.AssessmentAttempts
                .FirstOrDefaultAsync(at => at.Id == dto.AssessmentAttemptId && at.CandidateId == candidateId);

            if (attempt == null)
            {
                return (false, "Assessment attempt not found.");
            }

            if (attempt.Status != AttemptStatus.InProgress)
            {
                return (false, $"Cannot save draft: attempt is {attempt.Status}.");
            }

            if (now > attempt.Deadline)
            {
                attempt.Status = AttemptStatus.TimedOut;
                await _context.SaveChangesAsync();
                return (false, "Cannot save draft: Assessment time has expired.");
            }

            var draft = await _context.DraftCodes
                .FirstOrDefaultAsync(d => d.AssessmentAttemptId == dto.AssessmentAttemptId && d.QuestionId == dto.QuestionId);

            if (draft == null)
            {
                draft = new DraftCode
                {
                    AssessmentAttemptId = dto.AssessmentAttemptId,
                    QuestionId = dto.QuestionId,
                    Language = dto.Language,
                    Code = dto.Code,
                    LastSavedAt = now
                };
                _context.DraftCodes.Add(draft);
            }
            else
            {
                draft.Language = dto.Language;
                draft.Code = dto.Code;
                draft.LastSavedAt = now;
            }

            await _context.SaveChangesAsync();
            return (true, "Draft saved successfully.");
        }

        public async Task<(bool Success, string Message, int FinalScore)> FinalizeAttemptSubmissionAsync(int attemptId, string candidateId)
        {
            var now = DateTime.UtcNow;
            var attempt = await _context.AssessmentAttempts
                .Include(at => at.Submissions)
                .FirstOrDefaultAsync(at => at.Id == attemptId && at.CandidateId == candidateId);

            if (attempt == null)
            {
                return (false, "Assessment attempt not found.", 0);
            }

            if (attempt.Status != AttemptStatus.InProgress)
            {
                return (false, $"Attempt has already been finalized as {attempt.Status}.", attempt.TotalScore);
            }

            // Calculate total score from latest submissions for each question
            var latestSubmissions = attempt.Submissions
                .GroupBy(s => s.QuestionId)
                .Select(g => g.OrderByDescending(s => s.SubmittedAt).First())
                .ToList();

            var totalMarks = latestSubmissions.Sum(s => s.MarksObtained);

            attempt.TotalScore = totalMarks;
            attempt.SubmittedAt = now;
            attempt.Status = now > attempt.Deadline ? AttemptStatus.TimedOut : AttemptStatus.Submitted;

            await _context.SaveChangesAsync();
            return (true, "Assessment submitted successfully.", totalMarks);
        }

        public async Task<bool> IsAttemptActiveAndValidAsync(int attemptId, string candidateId)
        {
            var now = DateTime.UtcNow;
            var attempt = await _context.AssessmentAttempts
                .FirstOrDefaultAsync(at => at.Id == attemptId && at.CandidateId == candidateId);

            if (attempt == null) return false;
            if (attempt.Status != AttemptStatus.InProgress) return false;
            if (now > attempt.Deadline)
            {
                attempt.Status = AttemptStatus.TimedOut;
                await _context.SaveChangesAsync();
                return false;
            }

            return true;
        }

        private static AssessmentAttemptDto MapToAttemptDto(AssessmentAttempt attempt, Assessment assessment, DateTime now)
        {
            var remaining = (long)(attempt.Deadline - now).TotalSeconds;
            if (remaining < 0) remaining = 0;

            return new AssessmentAttemptDto
            {
                Id = attempt.Id,
                AssessmentId = assessment.Id,
                AssessmentTitle = assessment.Title,
                AssessmentDescription = assessment.Description,
                DurationMinutes = assessment.DurationMinutes,
                StartedAt = attempt.StartedAt,
                Deadline = attempt.Deadline,
                RemainingSeconds = remaining,
                Status = attempt.Status.ToString(),
                TotalScore = attempt.TotalScore,
                Questions = assessment.Questions.Select(q => new QuestionCandidateDto
                {
                    Id = q.Id,
                    AssessmentId = q.AssessmentId,
                    Title = q.Title,
                    ProblemDescription = q.ProblemDescription,
                    InputFormat = q.InputFormat,
                    OutputFormat = q.OutputFormat,
                    Constraints = q.Constraints,
                    Difficulty = q.Difficulty.ToString(),
                    SupportedLanguages = q.SupportedLanguages,
                    Marks = q.Marks,
                    SampleInput = q.SampleInput,
                    SampleExpectedOutput = q.SampleExpectedOutput,
                    SampleTestCases = q.TestCases.Select(tc => new SampleTestCaseDto
                    {
                        Id = tc.Id,
                        Input = tc.Input,
                        ExpectedOutput = tc.ExpectedOutput
                    }).ToList()
                }).ToList(),
                Drafts = attempt.DraftCodes.Select(d => new DraftCodeDto
                {
                    QuestionId = d.QuestionId,
                    Language = d.Language,
                    Code = d.Code,
                    LastSavedAt = d.LastSavedAt
                }).ToList(),
                Submissions = attempt.Submissions.Select(s => new SubmissionSummaryDto
                {
                    Id = s.Id,
                    QuestionId = s.QuestionId,
                    Language = s.Language,
                    Status = s.Status.ToString(),
                    PassedTestCases = s.PassedTestCases,
                    TotalTestCases = s.TotalTestCases,
                    MarksObtained = s.MarksObtained,
                    SubmittedAt = s.SubmittedAt
                }).ToList()
            };
        }
    }
}
