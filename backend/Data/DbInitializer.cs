using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using CodingAssessment.Api.Models;

namespace CodingAssessment.Api.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            // Apply migrations for SQL Server or ensure schema created for PostgreSQL / others
            if (context.Database.IsSqlServer())
            {
                try
                {
                    await context.Database.MigrateAsync();
                }
                catch
                {
                    await context.Database.EnsureCreatedAsync();
                }
            }
            else
            {
                await context.Database.EnsureCreatedAsync();
            }

            // Seed Roles
            if (!await roleManager.RoleExistsAsync(AppRoles.Administrator))
            {
                await roleManager.CreateAsync(new IdentityRole(AppRoles.Administrator));
            }
            if (!await roleManager.RoleExistsAsync(AppRoles.Candidate))
            {
                await roleManager.CreateAsync(new IdentityRole(AppRoles.Candidate));
            }

            // Seed Admin User
            var adminEmail = "admin@assessment.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FullName = "System Administrator",
                    Role = AppRoles.Administrator,
                    EmailConfirmed = true
                };
                var result = await userManager.CreateAsync(adminUser, "Admin@Password123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, AppRoles.Administrator);
                }
            }

            // Seed Demo Candidate User
            var candidateEmail = "candidate@assessment.com";
            var candidateUser = await userManager.FindByEmailAsync(candidateEmail);
            if (candidateUser == null)
            {
                candidateUser = new ApplicationUser
                {
                    UserName = candidateEmail,
                    Email = candidateEmail,
                    FullName = "Alex Candidate",
                    Role = AppRoles.Candidate,
                    EmailConfirmed = true
                };
                var result = await userManager.CreateAsync(candidateUser, "Candidate@Password123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(candidateUser, AppRoles.Candidate);
                }
            }

            // Seed sample assessment if none exist
            if (!await context.Assessments.AnyAsync())
            {
                var assessment = new Assessment
                {
                    Title = "Software Engineering Coding Evaluation",
                    Description = "Core programming assessment covering arrays, string manipulation, and algorithmic logic. Language options: C#, C++, Java, and Python.",
                    DurationMinutes = 60,
                    StartTime = DateTime.UtcNow.AddHours(-1),
                    EndTime = DateTime.UtcNow.AddDays(14),
                    TotalMarks = 100,
                    IsPublished = true,
                    CreatedByAdminId = adminUser!.Id,
                    CreatedAt = DateTime.UtcNow
                };

                // Question 1: Two Sum
                var q1 = new Question
                {
                    Title = "Two Sum Target Indices",
                    ProblemDescription = "Given a list of space-separated integers followed on the next line by a target integer, find the zero-based indices of two numbers that add up to the target. Print the indices separated by a space in ascending order. You may assume each input has exactly one valid solution.",
                    InputFormat = "First line: space-separated integers representing the array.\nSecond line: single integer representing the target.",
                    OutputFormat = "Single line: two space-separated integers representing the indices.",
                    Constraints = "2 <= array length <= 10^4\n-10^9 <= target <= 10^9",
                    Difficulty = DifficultyLevel.Easy,
                    SupportedLanguages = "csharp,cpp,java,python",
                    Marks = 50,
                    SampleInput = "2 7 11 15\n9",
                    SampleExpectedOutput = "0 1",
                    TestCases = new List<TestCase>
                    {
                        // Visible sample
                        new TestCase
                        {
                            Input = "2 7 11 15\n9",
                            ExpectedOutput = "0 1",
                            IsHidden = false,
                            Weight = 1
                        },
                        // Hidden test cases
                        new TestCase
                        {
                            Input = "3 2 4\n6",
                            ExpectedOutput = "1 2",
                            IsHidden = true,
                            Weight = 2
                        },
                        new TestCase
                        {
                            Input = "3 3\n6",
                            ExpectedOutput = "0 1",
                            IsHidden = true,
                            Weight = 2
                        },
                        new TestCase
                        {
                            Input = "1 5 8 10 14\n18",
                            ExpectedOutput = "2 3",
                            IsHidden = true,
                            Weight = 2
                        }
                    }
                };

                // Question 2: Palindrome Checker
                var q2 = new Question
                {
                    Title = "Clean Palindrome Checker",
                    ProblemDescription = "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string, output 'true' if it is a palindrome, or 'false' otherwise.",
                    InputFormat = "Single line containing a string.",
                    OutputFormat = "Single word: 'true' or 'false'.",
                    Constraints = "1 <= length <= 2 * 10^5",
                    Difficulty = DifficultyLevel.Medium,
                    SupportedLanguages = "csharp,cpp,java,python",
                    Marks = 50,
                    SampleInput = "A man, a plan, a canal: Panama",
                    SampleExpectedOutput = "true",
                    TestCases = new List<TestCase>
                    {
                        // Visible sample
                        new TestCase
                        {
                            Input = "A man, a plan, a canal: Panama",
                            ExpectedOutput = "true",
                            IsHidden = false,
                            Weight = 1
                        },
                        // Hidden test cases
                        new TestCase
                        {
                            Input = "race a car",
                            ExpectedOutput = "false",
                            IsHidden = true,
                            Weight = 2
                        },
                        new TestCase
                        {
                            Input = "Was it a car or a cat I saw?",
                            ExpectedOutput = "true",
                            IsHidden = true,
                            Weight = 2
                        },
                        new TestCase
                        {
                            Input = "No lemon, no melon",
                            ExpectedOutput = "true",
                            IsHidden = true,
                            Weight = 2
                        }
                    }
                };

                assessment.Questions.Add(q1);
                assessment.Questions.Add(q2);

                context.Assessments.Add(assessment);
                await context.SaveChangesAsync();
            }
        }
    }
}
