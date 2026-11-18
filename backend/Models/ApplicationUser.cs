using Microsoft.AspNetCore.Identity;

namespace CodingAssessment.Api.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = AppRoles.Candidate;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<AssessmentAttempt> AssessmentAttempts { get; set; } = new List<AssessmentAttempt>();
        public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
    }
}
