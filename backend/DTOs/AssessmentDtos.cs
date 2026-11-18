using System.ComponentModel.DataAnnotations;

namespace CodingAssessment.Api.DTOs
{
    public class AssessmentListDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int TotalMarks { get; set; }
        public bool IsPublished { get; set; }
        public int QuestionCount { get; set; }
        public string Status { get; set; } = "Upcoming"; // Upcoming, Active, Ended
        public bool HasAttempted { get; set; }
        public int? AttemptId { get; set; }
        public string? AttemptStatus { get; set; }
    }

    public class AssessmentDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int TotalMarks { get; set; }
        public bool IsPublished { get; set; }
        public string Status { get; set; } = "Active";
        public List<QuestionCandidateDto> Questions { get; set; } = new();
    }

    public class CreateAssessmentDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Range(1, 1440)]
        public int DurationMinutes { get; set; } = 60;

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        public int TotalMarks { get; set; } = 100;
        public bool IsPublished { get; set; } = false;
    }

    public class UpdateAssessmentDto : CreateAssessmentDto
    {
    }
}
