namespace CodingAssessment.Api.DTOs
{
    public class CandidateAssessmentResultDto
    {
        public int AttemptId { get; set; }
        public int AssessmentId { get; set; }
        public string AssessmentTitle { get; set; } = string.Empty;
        public int TotalMarks { get; set; }
        public int MarksObtained { get; set; }
        public double Percentage { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime StartedAt { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public List<QuestionResultSummaryDto> QuestionResults { get; set; } = new();
    }

    public class QuestionResultSummaryDto
    {
        public int QuestionId { get; set; }
        public string QuestionTitle { get; set; } = string.Empty;
        public int MaxMarks { get; set; }
        public int MarksObtained { get; set; }
        public string Status { get; set; } = "Not Attempted";
        public int PassedTestCases { get; set; }
        public int TotalTestCases { get; set; }
        public string? Language { get; set; }
        public DateTime? SubmittedAt { get; set; }
    }

    public class LeaderboardEntryDto
    {
        public int Rank { get; set; }
        public string CandidateId { get; set; } = string.Empty;
        public string CandidateName { get; set; } = string.Empty;
        public string CandidateEmail { get; set; } = string.Empty;
        public int MarksObtained { get; set; }
        public int TotalMarks { get; set; }
        public double Percentage { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class AssessmentLeaderboardDto
    {
        public int AssessmentId { get; set; }
        public string AssessmentTitle { get; set; } = string.Empty;
        public int TotalMarks { get; set; }
        public int TotalParticipants { get; set; }
        public List<LeaderboardEntryDto> Rankings { get; set; } = new();
    }
}
