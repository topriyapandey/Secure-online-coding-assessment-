using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using CodingAssessment.Api.Models;

namespace CodingAssessment.Api.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Assessment> Assessments => Set<Assessment>();
        public DbSet<Question> Questions => Set<Question>();
        public DbSet<TestCase> TestCases => Set<TestCase>();
        public DbSet<AssessmentAttempt> AssessmentAttempts => Set<AssessmentAttempt>();
        public DbSet<DraftCode> DraftCodes => Set<DraftCode>();
        public DbSet<Submission> Submissions => Set<Submission>();
        public DbSet<SubmissionResult> SubmissionResults => Set<SubmissionResult>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Assessment relationships
            builder.Entity<Assessment>()
                .HasMany(a => a.Questions)
                .WithOne(q => q.Assessment)
                .HasForeignKey(q => q.AssessmentId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Assessment>()
                .HasMany(a => a.Attempts)
                .WithOne(at => at.Assessment)
                .HasForeignKey(at => at.AssessmentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Question relationships
            builder.Entity<Question>()
                .HasMany(q => q.TestCases)
                .WithOne(tc => tc.Question)
                .HasForeignKey(tc => tc.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Question>()
                .HasMany(q => q.Submissions)
                .WithOne(s => s.Question)
                .HasForeignKey(s => s.QuestionId)
                .OnDelete(DeleteBehavior.Restrict);

            // AssessmentAttempt relationships
            builder.Entity<AssessmentAttempt>()
                .HasMany(at => at.Submissions)
                .WithOne(s => s.AssessmentAttempt)
                .HasForeignKey(s => s.AssessmentAttemptId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<AssessmentAttempt>()
                .HasMany(at => at.DraftCodes)
                .WithOne(d => d.AssessmentAttempt)
                .HasForeignKey(d => d.AssessmentAttemptId)
                .OnDelete(DeleteBehavior.Cascade);

            // Submission relationships
            builder.Entity<Submission>()
                .HasMany(s => s.TestResults)
                .WithOne(tr => tr.Submission)
                .HasForeignKey(tr => tr.SubmissionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<SubmissionResult>()
                .HasOne(tr => tr.TestCase)
                .WithMany()
                .HasForeignKey(tr => tr.TestCaseId)
                .OnDelete(DeleteBehavior.Restrict);

            // User relationships
            builder.Entity<ApplicationUser>()
                .HasMany(u => u.AssessmentAttempts)
                .WithOne(at => at.Candidate)
                .HasForeignKey(at => at.CandidateId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<ApplicationUser>()
                .HasMany(u => u.Submissions)
                .WithOne(s => s.Candidate)
                .HasForeignKey(s => s.CandidateId)
                .OnDelete(DeleteBehavior.Restrict);

            // Indexes for performance
            builder.Entity<AssessmentAttempt>()
                .HasIndex(a => new { a.AssessmentId, a.CandidateId });

            builder.Entity<Submission>()
                .HasIndex(s => new { s.AssessmentAttemptId, s.QuestionId });

            builder.Entity<TestCase>()
                .HasIndex(tc => tc.QuestionId);
        }
    }
}
