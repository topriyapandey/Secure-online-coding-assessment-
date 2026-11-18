using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodingAssessment.Api.Models
{
    public class Question
    {
        [Key]
        public int Id { get; set; }

        public int AssessmentId { get; set; }
        [ForeignKey(nameof(AssessmentId))]
        public Assessment? Assessment { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string ProblemDescription { get; set; } = string.Empty;

        public string InputFormat { get; set; } = string.Empty;
        public string OutputFormat { get; set; } = string.Empty;
        public string Constraints { get; set; } = string.Empty;

        public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Medium;

        public string SupportedLanguages { get; set; } = "csharp,cpp,java,python";

        [Range(1, 1000)]
        public int Marks { get; set; } = 10;

        public string SampleInput { get; set; } = string.Empty;
        public string SampleExpectedOutput { get; set; } = string.Empty;

        // Navigation
        public ICollection<TestCase> TestCases { get; set; } = new List<TestCase>();
        public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
    }
}
