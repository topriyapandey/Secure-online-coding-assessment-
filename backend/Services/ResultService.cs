using Microsoft.EntityFrameworkCore;
using CodingAssessment.Api.Data;
using CodingAssessment.Api.DTOs;
using CodingAssessment.Api.Models;

namespace CodingAssessment.Api.Services
{
    public interface IResultService
    {
        Task<CandidateAssessmentResultDto?> GetAttemptResultAsync(int attemptId, string candidateId);
        Task<List<CandidateAssessmentResultDto>> GetCandidateHistoryAsync(string candidateId);
        Task<AssessmentLeaderboardDto?> GetAssessmentLeaderboardAsync(int assessmentId);
        Task<AdminDashboardStatsDto> GetAdminDashboardStatsAsync();
        Task<List<CandidateUserDto>> GetAllCandidatesAsync();
        Task<List<AdminSubmissionDto>> GetAllSubmissionsAsync(int? assessmentId = null);
    }

    public class ResultService : IResultService
    {
        private readonly ApplicationDbContext _context;

        public ResultService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CandidateAssessmentResultDto?> GetAttemptResultAsync(int attemptId, string candidateId)
        {
            var attempt = await _context.AssessmentAttempts
                .Include(at => at.Assessment)
                    .ThenInclude(a => a!.Questions)
                .Include(at => at.Submissions)
                .FirstOrDefaultAsync(at => at.Id == attemptId && at.CandidateId == candidateId);

            if (attempt == null || attempt.Assessment == null) return null;

            return BuildCandidateResultDto(attempt);
        }

        public async Task<List<CandidateAssessmentResultDto>> GetCandidateHistoryAsync(string candidateId)
        {
            var attempts = await _context.AssessmentAttempts
                .Include(at => at.Assessment)
                    .ThenInclude(a => a!.Questions)
                .Include(at => at.Submissions)
                .Where(at => at.CandidateId == candidateId)
                .OrderByDescending(at => at.StartedAt)
                .ToListAsync();

            return attempts.Select(BuildCandidateResultDto).ToList();
        }

        public async Task<AssessmentLeaderboardDto?> GetAssessmentLeaderboardAsync(int assessmentId)
        {
            var assessment = await _context.Assessments
                .FirstOrDefaultAsync(a => a.Id == assessmentId);

            if (assessment == null) return null;

            var attempts = await _context.AssessmentAttempts
                .Include(at => at.Candidate)
                .Include(at => at.Submissions)
                .Where(at => at.AssessmentId == assessmentId && at.Status != AttemptStatus.InProgress)
                .ToListAsync();

            var rankedAttempts = attempts.Select(at =>
            {
                // Take latest submission for each question
                var latestSubs = at.Submissions
                    .GroupBy(s => s.QuestionId)
                    .Select(g => g.OrderByDescending(s => s.SubmittedAt).First())
                    .ToList();

                var totalScore = latestSubs.Sum(s => s.MarksObtained);
                var pct = assessment.TotalMarks > 0 ? (double)totalScore / assessment.TotalMarks * 100.0 : 0.0;

                return new
                {
                    at.CandidateId,
                    CandidateName = at.Candidate?.FullName ?? "Unknown Candidate",
                    CandidateEmail = at.Candidate?.Email ?? "unknown",
                    MarksObtained = totalScore,
                    TotalMarks = assessment.TotalMarks,
                    Percentage = Math.Round(pct, 2),
                    at.SubmittedAt,
                    Status = at.Status.ToString()
                };
            })
            .OrderByDescending(x => x.MarksObtained)
            .ThenBy(x => x.SubmittedAt ?? DateTime.MaxValue)
            .ToList();

            var rankings = new List<LeaderboardEntryDto>();
            for (int i = 0; i < rankedAttempts.Count; i++)
            {
                var r = rankedAttempts[i];
                rankings.Add(new LeaderboardEntryDto
                {
                    Rank = i + 1,
                    CandidateId = r.CandidateId,
                    CandidateName = r.CandidateName,
                    CandidateEmail = r.CandidateEmail,
                    MarksObtained = r.MarksObtained,
                    TotalMarks = r.TotalMarks,
                    Percentage = r.Percentage,
                    SubmittedAt = r.SubmittedAt,
                    Status = r.Status
                });
            }

            return new AssessmentLeaderboardDto
            {
                AssessmentId = assessment.Id,
                AssessmentTitle = assessment.Title,
                TotalMarks = assessment.TotalMarks,
                TotalParticipants = rankings.Count,
                Rankings = rankings
            };
        }

        public async Task<AdminDashboardStatsDto> GetAdminDashboardStatsAsync()
        {
            var now = DateTime.UtcNow;

            var totalCandidates = await _context.Users
                .Where(u => u.Role == AppRoles.Candidate)
                .CountAsync();

            var totalAssessments = await _context.Assessments.CountAsync();

            var activeAssessments = await _context.Assessments
                .Where(a => a.IsPublished && a.StartTime <= now && a.EndTime >= now)
                .CountAsync();

            var totalSubmissions = await _context.Submissions.CountAsync();

            var recentSubmissions = await _context.Submissions
                .Include(s => s.Candidate)
                .Include(s => s.Question)
                .OrderByDescending(s => s.SubmittedAt)
                .Take(5)
                .Select(s => new RecentActivityDto
                {
                    ActivityType = "Submission",
                    Description = $"{s.Candidate!.FullName} submitted solution for '{s.Question!.Title}' ({s.Status}, {s.MarksObtained} marks)",
                    Timestamp = s.SubmittedAt
                })
                .ToListAsync();

            var recentAttempts = await _context.AssessmentAttempts
                .Include(at => at.Candidate)
                .Include(at => at.Assessment)
                .OrderByDescending(at => at.StartedAt)
                .Take(5)
                .Select(at => new RecentActivityDto
                {
                    ActivityType = "AttemptStarted",
                    Description = $"{at.Candidate!.FullName} started assessment '{at.Assessment!.Title}'",
                    Timestamp = at.StartedAt
                })
                .ToListAsync();

            var combinedActivities = recentSubmissions
                .Concat(recentAttempts)
                .OrderByDescending(a => a.Timestamp)
                .Take(8)
                .ToList();

            return new AdminDashboardStatsDto
            {
                TotalCandidates = totalCandidates,
                TotalAssessments = totalAssessments,
                ActiveAssessments = activeAssessments,
                TotalSubmissions = totalSubmissions,
                RecentActivities = combinedActivities
            };
        }

        public async Task<List<CandidateUserDto>> GetAllCandidatesAsync()
        {
            var candidates = await _context.Users
                .Where(u => u.Role == AppRoles.Candidate)
                .Include(u => u.AssessmentAttempts)
                .Include(u => u.Submissions)
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            return candidates.Select(c => new CandidateUserDto
            {
                Id = c.Id,
                FullName = c.FullName,
                Email = c.Email ?? string.Empty,
                CreatedAt = c.CreatedAt,
                TotalAttempts = c.AssessmentAttempts.Count,
                TotalSubmissions = c.Submissions.Count
            }).ToList();
        }

        public async Task<List<AdminSubmissionDto>> GetAllSubmissionsAsync(int? assessmentId = null)
        {
            var query = _context.Submissions
                .Include(s => s.Candidate)
                .Include(s => s.Question)
                    .ThenInclude(q => q!.Assessment)
                .AsQueryable();

            if (assessmentId.HasValue)
            {
                query = query.Where(s => s.Question != null && s.Question.AssessmentId == assessmentId.Value);
            }

            var submissions = await query
                .OrderByDescending(s => s.SubmittedAt)
                .Take(100)
                .ToListAsync();

            return submissions.Select(s => new AdminSubmissionDto
            {
                Id = s.Id,
                CandidateName = s.Candidate?.FullName ?? "Unknown",
                CandidateEmail = s.Candidate?.Email ?? "Unknown",
                AssessmentTitle = s.Question?.Assessment?.Title ?? "Unknown",
                QuestionTitle = s.Question?.Title ?? "Unknown",
                Language = s.Language,
                Status = s.Status.ToString(),
                PassedTestCases = s.PassedTestCases,
                TotalTestCases = s.TotalTestCases,
                MarksObtained = s.MarksObtained,
                SubmittedAt = s.SubmittedAt,
                SourceCode = s.SourceCode
            }).ToList();
        }

        private static CandidateAssessmentResultDto BuildCandidateResultDto(AssessmentAttempt attempt)
        {
            var assessment = attempt.Assessment!;
            var questions = assessment.Questions.ToList();

            // Group submissions by question and take the highest scoring/latest submission
            var questionSummaries = questions.Select(q =>
            {
                var questionSubs = attempt.Submissions
                    .Where(s => s.QuestionId == q.Id)
                    .OrderByDescending(s => s.MarksObtained)
                    .ThenByDescending(s => s.SubmittedAt)
                    .FirstOrDefault();

                return new QuestionResultSummaryDto
                {
                    QuestionId = q.Id,
                    QuestionTitle = q.Title,
                    MaxMarks = q.Marks,
                    MarksObtained = questionSubs?.MarksObtained ?? 0,
                    Status = questionSubs?.Status.ToString() ?? "Not Attempted",
                    PassedTestCases = questionSubs?.PassedTestCases ?? 0,
                    TotalTestCases = questionSubs?.TotalTestCases ?? 0,
                    Language = questionSubs?.Language,
                    SubmittedAt = questionSubs?.SubmittedAt
                };
            }).ToList();

            var totalMarksObtained = questionSummaries.Sum(qs => qs.MarksObtained);
            var percentage = assessment.TotalMarks > 0
                ? Math.Round(((double)totalMarksObtained / assessment.TotalMarks) * 100.0, 2)
                : 0.0;

            return new CandidateAssessmentResultDto
            {
                AttemptId = attempt.Id,
                AssessmentId = assessment.Id,
                AssessmentTitle = assessment.Title,
                TotalMarks = assessment.TotalMarks,
                MarksObtained = totalMarksObtained,
                Percentage = percentage,
                Status = attempt.Status.ToString(),
                StartedAt = attempt.StartedAt,
                SubmittedAt = attempt.SubmittedAt,
                QuestionResults = questionSummaries
            };
        }
    }
}
