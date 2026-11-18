using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodingAssessment.Api.Models
{
    public class AssessmentAttempt
    {
        [Key]
        public int Id { get; set; }

        public int AssessmentId { get; set; }
        [ForeignKey(nameof(AssessmentId))]
        public Assessment? Assessment { get; set; }

        [Required]
        public string CandidateId { get; set; } = string.Empty;
        [ForeignKey(nameof(CandidateId))]
        public ApplicationUser? Candidate { get; set; }

        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime Deadline { get; set; }
        public DateTime? SubmittedAt { get; set; }

        public AttemptStatus Status { get; set; } = AttemptStatus.InProgress;

        public int TotalScore { get; set; } = 0;

        // Navigation
        public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
        public ICollection<DraftCode> DraftCodes { get; set; } = new List<DraftCode>();
    }

    public class DraftCode
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
        [MaxLength(50)]
        public string Language { get; set; } = "python";

        public string Code { get; set; } = string.Empty;

        public DateTime LastSavedAt { get; set; } = DateTime.UtcNow;
    }
}
