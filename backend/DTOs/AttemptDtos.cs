using System.ComponentModel.DataAnnotations;

namespace CodingAssessment.Api.DTOs
{
    public class StartAttemptRequestDto
    {
        [Required]
        public int AssessmentId { get; set; }
    }

    public class AssessmentAttemptDto
    {
        public int Id { get; set; }
        public int AssessmentId { get; set; }
        public string AssessmentTitle { get; set; } = string.Empty;
        public string AssessmentDescription { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime Deadline { get; set; }
        public long RemainingSeconds { get; set; }
        public string Status { get; set; } = "InProgress";
        public int TotalScore { get; set; }
        public List<QuestionCandidateDto> Questions { get; set; } = new();
        public List<DraftCodeDto> Drafts { get; set; } = new();
        public List<SubmissionSummaryDto> Submissions { get; set; } = new();
    }

    public class SaveDraftRequestDto
    {
        [Required]
        public int AssessmentAttemptId { get; set; }

        [Required]
        public int QuestionId { get; set; }

        [Required]
        public string Language { get; set; } = "python";

        public string Code { get; set; } = string.Empty;
    }

    public class DraftCodeDto
    {
        public int QuestionId { get; set; }
        public string Language { get; set; } = "python";
        public string Code { get; set; } = string.Empty;
        public DateTime LastSavedAt { get; set; }
    }

    public class SubmissionSummaryDto
    {
        public int Id { get; set; }
        public int QuestionId { get; set; }
        public string Language { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int PassedTestCases { get; set; }
        public int TotalTestCases { get; set; }
        public int MarksObtained { get; set; }
        public DateTime SubmittedAt { get; set; }
    }
}
