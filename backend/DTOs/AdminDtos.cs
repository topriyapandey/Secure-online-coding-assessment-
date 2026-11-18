namespace CodingAssessment.Api.DTOs
{
    public class AdminDashboardStatsDto
    {
        public int TotalCandidates { get; set; }
        public int TotalAssessments { get; set; }
        public int ActiveAssessments { get; set; }
        public int TotalSubmissions { get; set; }
        public List<RecentActivityDto> RecentActivities { get; set; } = new();
    }

    public class RecentActivityDto
    {
        public string ActivityType { get; set; } = string.Empty; // Submission, AttemptStarted, AssessmentCreated
        public string Description { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }

    public class CandidateUserDto
    {
        public string Id { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int TotalAttempts { get; set; }
        public int TotalSubmissions { get; set; }
    }

    public class AdminSubmissionDto
    {
        public int Id { get; set; }
        public string CandidateName { get; set; } = string.Empty;
        public string CandidateEmail { get; set; } = string.Empty;
        public string AssessmentTitle { get; set; } = string.Empty;
        public string QuestionTitle { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int PassedTestCases { get; set; }
        public int TotalTestCases { get; set; }
        public int MarksObtained { get; set; }
        public DateTime SubmittedAt { get; set; }
        public string SourceCode { get; set; } = string.Empty;
    }
}
