using Microsoft.EntityFrameworkCore;
using CodingAssessment.Api.Data;
using CodingAssessment.Api.DTOs;
using CodingAssessment.Api.Models;

namespace CodingAssessment.Api.Services
{
    public interface IAssessmentService
    {
        Task<List<AssessmentListDto>> GetAllForAdminAsync();
        Task<List<AssessmentListDto>> GetAvailableForCandidateAsync(string candidateId);
        Task<AssessmentDetailDto?> GetByIdForCandidateAsync(int id);
        Task<AssessmentAdminDto?> GetByIdForAdminAsync(int id);
        Task<(bool Success, string Message, int? Id)> CreateAssessmentAsync(CreateAssessmentDto dto, string adminUserId);
        Task<(bool Success, string Message)> UpdateAssessmentAsync(int id, UpdateAssessmentDto dto);
        Task<(bool Success, string Message)> DeleteAssessmentAsync(int id);
    }

    public class AssessmentAdminDto : AssessmentDetailDto
    {
        public List<QuestionAdminDto> AdminQuestions { get; set; } = new();
    }

    public class AssessmentService : IAssessmentService
    {
        private readonly ApplicationDbContext _context;

        public AssessmentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<AssessmentListDto>> GetAllForAdminAsync()
        {
            var now = DateTime.UtcNow;
            var assessments = await _context.Assessments
                .Include(a => a.Questions)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return assessments.Select(a => new AssessmentListDto
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                DurationMinutes = a.DurationMinutes,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                TotalMarks = a.TotalMarks,
                IsPublished = a.IsPublished,
                QuestionCount = a.Questions.Count,
                Status = GetAssessmentStatus(a.StartTime, a.EndTime, now)
            }).ToList();
        }

        public async Task<List<AssessmentListDto>> GetAvailableForCandidateAsync(string candidateId)
        {
            var now = DateTime.UtcNow;
            var assessments = await _context.Assessments
                .Where(a => a.IsPublished)
                .Include(a => a.Questions)
                .Include(a => a.Attempts.Where(at => at.CandidateId == candidateId))
                .OrderByDescending(a => a.StartTime)
                .ToListAsync();

            return assessments.Select(a =>
            {
                var attempt = a.Attempts.FirstOrDefault();
                return new AssessmentListDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Description = a.Description,
                    DurationMinutes = a.DurationMinutes,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    TotalMarks = a.TotalMarks,
                    IsPublished = a.IsPublished,
                    QuestionCount = a.Questions.Count,
                    Status = GetAssessmentStatus(a.StartTime, a.EndTime, now),
                    HasAttempted = attempt != null,
                    AttemptId = attempt?.Id,
                    AttemptStatus = attempt?.Status.ToString()
                };
            }).ToList();
        }

        public async Task<AssessmentDetailDto?> GetByIdForCandidateAsync(int id)
        {
            var now = DateTime.UtcNow;
            var assessment = await _context.Assessments
                .Include(a => a.Questions)
                    .ThenInclude(q => q.TestCases.Where(tc => !tc.IsHidden))
                .FirstOrDefaultAsync(a => a.Id == id && a.IsPublished);

            if (assessment == null) return null;

            return new AssessmentDetailDto
            {
                Id = assessment.Id,
                Title = assessment.Title,
                Description = assessment.Description,
                DurationMinutes = assessment.DurationMinutes,
                StartTime = assessment.StartTime,
                EndTime = assessment.EndTime,
                TotalMarks = assessment.TotalMarks,
                IsPublished = assessment.IsPublished,
                Status = GetAssessmentStatus(assessment.StartTime, assessment.EndTime, now),
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
                }).ToList()
            };
        }

        public async Task<AssessmentAdminDto?> GetByIdForAdminAsync(int id)
        {
            var now = DateTime.UtcNow;
            var assessment = await _context.Assessments
                .Include(a => a.Questions)
                    .ThenInclude(q => q.TestCases)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (assessment == null) return null;

            return new AssessmentAdminDto
            {
                Id = assessment.Id,
                Title = assessment.Title,
                Description = assessment.Description,
                DurationMinutes = assessment.DurationMinutes,
                StartTime = assessment.StartTime,
                EndTime = assessment.EndTime,
                TotalMarks = assessment.TotalMarks,
                IsPublished = assessment.IsPublished,
                Status = GetAssessmentStatus(assessment.StartTime, assessment.EndTime, now),
                AdminQuestions = assessment.Questions.Select(q => new QuestionAdminDto
                {
                    Id = q.Id,
                    AssessmentId = q.AssessmentId,
                    AssessmentTitle = assessment.Title,
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
                }).ToList()
            };
        }

        public async Task<(bool Success, string Message, int? Id)> CreateAssessmentAsync(CreateAssessmentDto dto, string adminUserId)
        {
            if (dto.EndTime <= dto.StartTime)
            {
                return (false, "End time must be after start time.", null);
            }

            var assessment = new Assessment
            {
                Title = dto.Title.Trim(),
                Description = dto.Description.Trim(),
                DurationMinutes = dto.DurationMinutes,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                TotalMarks = dto.TotalMarks,
                IsPublished = dto.IsPublished,
                CreatedByAdminId = adminUserId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Assessments.Add(assessment);
            await _context.SaveChangesAsync();

            return (true, "Assessment created successfully.", assessment.Id);
        }

        public async Task<(bool Success, string Message)> UpdateAssessmentAsync(int id, UpdateAssessmentDto dto)
        {
            var assessment = await _context.Assessments.FindAsync(id);
            if (assessment == null)
            {
                return (false, "Assessment not found.");
            }

            if (dto.EndTime <= dto.StartTime)
            {
                return (false, "End time must be after start time.");
            }

            assessment.Title = dto.Title.Trim();
            assessment.Description = dto.Description.Trim();
            assessment.DurationMinutes = dto.DurationMinutes;
            assessment.StartTime = dto.StartTime;
            assessment.EndTime = dto.EndTime;
            assessment.TotalMarks = dto.TotalMarks;
            assessment.IsPublished = dto.IsPublished;

            await _context.SaveChangesAsync();
            return (true, "Assessment updated successfully.");
        }

        public async Task<(bool Success, string Message)> DeleteAssessmentAsync(int id)
        {
            var assessment = await _context.Assessments.FindAsync(id);
            if (assessment == null)
            {
                return (false, "Assessment not found.");
            }

            _context.Assessments.Remove(assessment);
            await _context.SaveChangesAsync();
            return (true, "Assessment deleted successfully.");
        }

        private static string GetAssessmentStatus(DateTime startTime, DateTime endTime, DateTime now)
        {
            if (now < startTime) return "Upcoming";
            if (now > endTime) return "Ended";
            return "Active";
        }
    }
}
