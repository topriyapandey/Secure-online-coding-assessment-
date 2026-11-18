using System.ComponentModel.DataAnnotations;

namespace CodingAssessment.Api.DTOs
{
    public class RunCodeRequestDto
    {
        [Required]
        public int QuestionId { get; set; }

        [Required]
        public string SourceCode { get; set; } = string.Empty;

        [Required]
        public string Language { get; set; } = string.Empty; // csharp, cpp, java, python

        public string? CustomInput { get; set; }
    }

    public class RunCodeResponseDto
    {
        public string Status { get; set; } = "Accepted"; // Accepted, Wrong Answer, Compilation Error, Runtime Error, Time Limit Exceeded
        public string? StandardOutput { get; set; }
        public string? ErrorMessage { get; set; }
        public string? CompileOutput { get; set; }
        public double? ExecutionTimeMs { get; set; }
        public double? MemoryKb { get; set; }
        public bool Passed { get; set; }
        public string? ExpectedOutput { get; set; }
    }

    public class SubmitCodeRequestDto
    {
        [Required]
        public int AssessmentAttemptId { get; set; }

        [Required]
        public int QuestionId { get; set; }

        [Required]
        public string SourceCode { get; set; } = string.Empty;

        [Required]
        public string Language { get; set; } = string.Empty;
    }

    public class SubmitCodeResponseDto
    {
        public int SubmissionId { get; set; }
        public string Status { get; set; } = "Accepted";
        public int PassedTestCases { get; set; }
        public int TotalTestCases { get; set; }
        public int MarksObtained { get; set; }
        public int MaxMarks { get; set; }
        public double? ExecutionTimeMs { get; set; }
        public double? MemoryKb { get; set; }
        public string? CompileOutput { get; set; }
        public List<TestCaseResultDetailDto> TestCaseResults { get; set; } = new();
    }

    public class TestCaseResultDetailDto
    {
        public int TestCaseNumber { get; set; }
        public bool IsHidden { get; set; }
        public bool Passed { get; set; }
        public string Status { get; set; } = "Passed";
        public string? Input { get; set; } // Only populated if NOT hidden
        public string? ExpectedOutput { get; set; } // Only populated if NOT hidden
        public string? ActualOutput { get; set; } // Only populated if NOT hidden
        public string? ErrorMessage { get; set; }
        public double? ExecutionTime { get; set; }
    }
}
