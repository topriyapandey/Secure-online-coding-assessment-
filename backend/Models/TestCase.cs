using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodingAssessment.Api.Models
{
    public class TestCase
    {
        [Key]
        public int Id { get; set; }

        public int QuestionId { get; set; }
        [ForeignKey(nameof(QuestionId))]
        public Question? Question { get; set; }

        public string Input { get; set; } = string.Empty;

        [Required]
        public string ExpectedOutput { get; set; } = string.Empty;

        public bool IsHidden { get; set; } = true;

        public int Weight { get; set; } = 1;
    }
}
