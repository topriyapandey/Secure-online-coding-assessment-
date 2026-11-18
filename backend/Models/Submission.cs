using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodingAssessment.Api.Models
{
    public class Submission
    {
        [Key]
        public int Id { get; set; }

        public int AssessmentAttemptId { get; set; }
        [ForeignKey(nameof(AssessmentAttemptId))]
        public AssessmentAttempt? AssessmentAttempt { get; set; }

        public int QuestionId { get; set; }
        [ForeignKey(nameof(QuestionId))]
        public Question? Question { get; set; }

        [Required]
        public string CandidateId { get; set; } = string.Empty;
        [ForeignKey(nameof(CandidateId))]
        public ApplicationUser? Candidate { get; set; }

        [Required]
        public string SourceCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Language { get; set; } = string.Empty;

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public SubmissionStatus Status { get; set; } = SubmissionStatus.Pending;

        public int PassedTestCases { get; set; } = 0;
        public int TotalTestCases { get; set; } = 0;
        public int MarksObtained { get; set; } = 0;

        public double? ExecutionTimeMs { get; set; }
        public double? MemoryKb { get; set; }
        public string? CompileOutput { get; set; }

        // Navigation
        public ICollection<SubmissionResult> TestResults { get; set; } = new List<SubmissionResult>();
    }

    public class SubmissionResult
    {
        [Key]
        public int Id { get; set; }

        public int SubmissionId { get; set; }
        [ForeignKey(nameof(SubmissionId))]
        public Submission? Submission { get; set; }

        public int TestCaseId { get; set; }
        [ForeignKey(nameof(TestCaseId))]
        public TestCase? TestCase { get; set; }

        public bool Passed { get; set; }
        public string? ActualOutput { get; set; }
        public double? ExecutionTime { get; set; }
        public double? Memory { get; set; }
        public string? StatusDescription { get; set; }
        public string? ErrorMessage { get; set; }
    }
}
