using Microsoft.EntityFrameworkCore;
using CodingAssessment.Api.Data;
using CodingAssessment.Api.DTOs;
using CodingAssessment.Api.Models;

namespace CodingAssessment.Api.Services
{
    public interface IQuestionService
    {
        Task<List<QuestionAdminDto>> GetQuestionsByAssessmentIdForAdminAsync(int assessmentId);
        Task<List<QuestionCandidateDto>> GetQuestionsByAssessmentIdForCandidateAsync(int assessmentId);
        Task<QuestionAdminDto?> GetQuestionByIdForAdminAsync(int id);
        Task<QuestionCandidateDto?> GetQuestionByIdForCandidateAsync(int id);
        Task<(bool Success, string Message, int? Id)> CreateQuestionAsync(CreateQuestionDto dto);
        Task<(bool Success, string Message)> UpdateQuestionAsync(int id, UpdateQuestionDto dto);
        Task<(bool Success, string Message)> DeleteQuestionAsync(int id);
    }

    public class QuestionService : IQuestionService
    {
        private readonly ApplicationDbContext _context;

        public QuestionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<QuestionAdminDto>> GetQuestionsByAssessmentIdForAdminAsync(int assessmentId)
        {
            var questions = await _context.Questions
                .Include(q => q.Assessment)
                .Include(q => q.TestCases)
                .Where(q => q.AssessmentId == assessmentId)
                .ToListAsync();

            return questions.Select(MapToAdminDto).ToList();
        }

        public async Task<List<QuestionCandidateDto>> GetQuestionsByAssessmentIdForCandidateAsync(int assessmentId)
        {
            var questions = await _context.Questions
                .Include(q => q.TestCases.Where(tc => !tc.IsHidden))
                .Where(q => q.AssessmentId == assessmentId)
                .ToListAsync();

            return questions.Select(MapToCandidateDto).ToList();
        }

        public async Task<QuestionAdminDto?> GetQuestionByIdForAdminAsync(int id)
        {
            var question = await _context.Questions
                .Include(q => q.Assessment)
                .Include(q => q.TestCases)
                .FirstOrDefaultAsync(q => q.Id == id);

            return question != null ? MapToAdminDto(question) : null;
        }

        public async Task<QuestionCandidateDto?> GetQuestionByIdForCandidateAsync(int id)
        {
            var question = await _context.Questions
                .Include(q => q.TestCases.Where(tc => !tc.IsHidden))
                .FirstOrDefaultAsync(q => q.Id == id);

            return question != null ? MapToCandidateDto(question) : null;
        }

        public async Task<(bool Success, string Message, int? Id)> CreateQuestionAsync(CreateQuestionDto dto)
        {
            var assessmentExists = await _context.Assessments.AnyAsync(a => a.Id == dto.AssessmentId);
            if (!assessmentExists)
            {
                return (false, "Assessment does not exist.", null);
            }

            var question = new Question
            {
                AssessmentId = dto.AssessmentId,
                Title = dto.Title.Trim(),
                ProblemDescription = dto.ProblemDescription.Trim(),
                InputFormat = dto.InputFormat.Trim(),
                OutputFormat = dto.OutputFormat.Trim(),
                Constraints = dto.Constraints.Trim(),
                Difficulty = dto.Difficulty,
                SupportedLanguages = string.IsNullOrWhiteSpace(dto.SupportedLanguages) ? "csharp,cpp,java,python" : dto.SupportedLanguages,
                Marks = dto.Marks,
                SampleInput = dto.SampleInput ?? string.Empty,
                SampleExpectedOutput = dto.SampleExpectedOutput ?? string.Empty
            };

            if (dto.TestCases != null && dto.TestCases.Any())
            {
                foreach (var tc in dto.TestCases)
                {
                    question.TestCases.Add(new TestCase
                    {
                        Input = tc.Input ?? string.Empty,
                        ExpectedOutput = tc.ExpectedOutput ?? string.Empty,
                        IsHidden = tc.IsHidden,
                        Weight = tc.Weight
                    });
                }
            }

            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            return (true, "Question created successfully.", question.Id);
        }

        public async Task<(bool Success, string Message)> UpdateQuestionAsync(int id, UpdateQuestionDto dto)
        {
            var question = await _context.Questions
                .Include(q => q.TestCases)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (question == null)
            {
                return (false, "Question not found.");
            }

            question.Title = dto.Title.Trim();
            question.ProblemDescription = dto.ProblemDescription.Trim();
            question.InputFormat = dto.InputFormat.Trim();
            question.OutputFormat = dto.OutputFormat.Trim();
            question.Constraints = dto.Constraints.Trim();
            question.Difficulty = dto.Difficulty;
            question.SupportedLanguages = dto.SupportedLanguages;
            question.Marks = dto.Marks;
            question.SampleInput = dto.SampleInput ?? string.Empty;
            question.SampleExpectedOutput = dto.SampleExpectedOutput ?? string.Empty;

            // Update test cases
            _context.TestCases.RemoveRange(question.TestCases);
            if (dto.TestCases != null && dto.TestCases.Any())
            {
                foreach (var tc in dto.TestCases)
                {
                    question.TestCases.Add(new TestCase
                    {
                        QuestionId = question.Id,
                        Input = tc.Input ?? string.Empty,
                        ExpectedOutput = tc.ExpectedOutput ?? string.Empty,
                        IsHidden = tc.IsHidden,
                        Weight = tc.Weight
                    });
                }
            }

            await _context.SaveChangesAsync();
            return (true, "Question updated successfully.");
        }

        public async Task<(bool Success, string Message)> DeleteQuestionAsync(int id)
        {
            var question = await _context.Questions.FindAsync(id);
            if (question == null)
            {
                return (false, "Question not found.");
            }

            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();
            return (true, "Question deleted successfully.");
        }

        private static QuestionAdminDto MapToAdminDto(Question q)
        {
            return new QuestionAdminDto
            {
                Id = q.Id,
                AssessmentId = q.AssessmentId,
                AssessmentTitle = q.Assessment?.Title ?? string.Empty,
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
                TestCases = q.TestCases.Select(tc => new TestCaseDto
                {
                    Id = tc.Id,
                    QuestionId = tc.QuestionId,
                    Input = tc.Input,
                    ExpectedOutput = tc.ExpectedOutput,
                    IsHidden = tc.IsHidden,
                    Weight = tc.Weight
                }).ToList()
            };
        }

        private static QuestionCandidateDto MapToCandidateDto(Question q)
        {
            return new QuestionCandidateDto
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
            };
        }
    }
}
