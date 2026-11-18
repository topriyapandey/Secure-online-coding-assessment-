using System.ComponentModel.DataAnnotations;
using CodingAssessment.Api.Models;

namespace CodingAssessment.Api.DTOs
{
    public class TestCaseDto
    {
        public int Id { get; set; }
        public int QuestionId { get; set; }
        public string Input { get; set; } = string.Empty;
        public string ExpectedOutput { get; set; } = string.Empty;
        public bool IsHidden { get; set; } = true;
        public int Weight { get; set; } = 1;
    }

    public class CreateTestCaseDto
    {
        public string Input { get; set; } = string.Empty;
        [Required]
        public string ExpectedOutput { get; set; } = string.Empty;
        public bool IsHidden { get; set; } = true;
        public int Weight { get; set; } = 1;
    }

    public class QuestionAdminDto
    {
        public int Id { get; set; }
        public int AssessmentId { get; set; }
        public string AssessmentTitle { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string ProblemDescription { get; set; } = string.Empty;
        public string InputFormat { get; set; } = string.Empty;
        public string OutputFormat { get; set; } = string.Empty;
        public string Constraints { get; set; } = string.Empty;
        public string Difficulty { get; set; } = "Medium";
        public string SupportedLanguages { get; set; } = "csharp,cpp,java,python";
        public int Marks { get; set; }
        public string SampleInput { get; set; } = string.Empty;
        public string SampleExpectedOutput { get; set; } = string.Empty;
        public List<TestCaseDto> TestCases { get; set; } = new();
    }

    public class QuestionCandidateDto
    {
        public int Id { get; set; }
        public int AssessmentId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ProblemDescription { get; set; } = string.Empty;
        public string InputFormat { get; set; } = string.Empty;
        public string OutputFormat { get; set; } = string.Empty;
        public string Constraints { get; set; } = string.Empty;
        public string Difficulty { get; set; } = "Medium";
        public string SupportedLanguages { get; set; } = "csharp,cpp,java,python";
        public int Marks { get; set; }
        public string SampleInput { get; set; } = string.Empty;
        public string SampleExpectedOutput { get; set; } = string.Empty;
        // Only visible sample test cases, NEVER hidden test cases
        public List<SampleTestCaseDto> SampleTestCases { get; set; } = new();
    }

    public class SampleTestCaseDto
    {
        public int Id { get; set; }
        public string Input { get; set; } = string.Empty;
        public string ExpectedOutput { get; set; } = string.Empty;
    }

    public class CreateQuestionDto
    {
        [Required]
        public int AssessmentId { get; set; }

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

        public List<CreateTestCaseDto> TestCases { get; set; } = new();
    }

    public class UpdateQuestionDto : CreateQuestionDto
    {
    }
}
