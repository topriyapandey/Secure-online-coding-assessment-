using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodingAssessment.Api.Models
{
    public class Assessment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Range(1, 1440)]
        public int DurationMinutes { get; set; }

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        public int TotalMarks { get; set; }

        public bool IsPublished { get; set; } = false;

        public string CreatedByAdminId { get; set; } = string.Empty;
        [ForeignKey(nameof(CreatedByAdminId))]
        public ApplicationUser? CreatedByAdmin { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Question> Questions { get; set; } = new List<Question>();
        public ICollection<AssessmentAttempt> Attempts { get; set; } = new List<AssessmentAttempt>();
    }
}
