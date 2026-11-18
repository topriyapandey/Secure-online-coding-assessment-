using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CodingAssessment.Api.Models;
using CodingAssessment.Api.Services;

namespace CodingAssessment.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ResultsController : ControllerBase
    {
        private readonly IResultService _resultService;

        public ResultsController(IResultService resultService)
        {
            _resultService = resultService;
        }

        [HttpGet("my-results")]
        public async Task<IActionResult> GetMyResults()
        {
            var candidateId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(candidateId))
            {
                return Unauthorized();
            }

            var history = await _resultService.GetCandidateHistoryAsync(candidateId);
            return Ok(history);
        }

        [HttpGet("attempt/{attemptId}")]
        public async Task<IActionResult> GetAttemptResult(int attemptId)
        {
            var candidateId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(candidateId))
            {
                return Unauthorized();
            }

            var result = await _resultService.GetAttemptResultAsync(attemptId, candidateId);
            if (result == null)
            {
                return NotFound(new { message = "Result not found or unauthorized." });
            }

            return Ok(result);
        }

        [HttpGet("leaderboard/{assessmentId}")]
        public async Task<IActionResult> GetLeaderboard(int assessmentId)
        {
            var leaderboard = await _resultService.GetAssessmentLeaderboardAsync(assessmentId);
            if (leaderboard == null)
            {
                return NotFound(new { message = "Assessment not found." });
            }

            return Ok(leaderboard);
        }
    }
}
