using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CodingAssessment.Api.DTOs;
using CodingAssessment.Api.Models;
using CodingAssessment.Api.Services;

namespace CodingAssessment.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AttemptsController : ControllerBase
    {
        private readonly IAssessmentAttemptService _attemptService;

        public AttemptsController(IAssessmentAttemptService attemptService)
        {
            _attemptService = attemptService;
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartAttempt([FromBody] StartAttemptRequestDto dto)
        {
            var candidateId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(candidateId))
            {
                return Unauthorized();
            }

            var (success, message, data) = await _attemptService.StartAttemptAsync(dto.AssessmentId, candidateId);
            if (!success)
            {
                return BadRequest(new { message });
            }

            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAttemptStatus(int id)
        {
            var candidateId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(candidateId))
            {
                return Unauthorized();
            }

            var attempt = await _attemptService.GetAttemptStatusAsync(id, candidateId);
            if (attempt == null)
            {
                return NotFound(new { message = "Attempt not found or unauthorized." });
            }

            return Ok(attempt);
        }

        [HttpPost("{id}/save-draft")]
        public async Task<IActionResult> SaveDraft(int id, [FromBody] SaveDraftRequestDto dto)
        {
            var candidateId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(candidateId))
            {
                return Unauthorized();
            }

            dto.AssessmentAttemptId = id;
            var (success, message) = await _attemptService.SaveDraftAsync(dto, candidateId);
            if (!success)
            {
                return BadRequest(new { message });
            }

            return Ok(new { message });
        }

        [HttpPost("{id}/submit")]
        public async Task<IActionResult> FinalizeSubmission(int id)
        {
            var candidateId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(candidateId))
            {
                return Unauthorized();
            }

            var (success, message, finalScore) = await _attemptService.FinalizeAttemptSubmissionAsync(id, candidateId);
            if (!success)
            {
                return BadRequest(new { message, finalScore });
            }

            return Ok(new { message, finalScore });
        }
    }
}
