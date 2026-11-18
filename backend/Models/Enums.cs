namespace CodingAssessment.Api.Models
{
    public enum DifficultyLevel
    {
        Easy = 1,
        Medium = 2,
        Hard = 3
    }

    public enum SubmissionStatus
    {
        Pending = 0,
        Accepted = 1,
        WrongAnswer = 2,
        CompilationError = 3,
        RuntimeError = 4,
        TimeLimitExceeded = 5
    }

    public enum AttemptStatus
    {
        InProgress = 1,
        Submitted = 2,
        TimedOut = 3
    }

    public static class AppRoles
    {
        public const string Administrator = "Administrator";
        public const string Candidate = "Candidate";
    }
}
