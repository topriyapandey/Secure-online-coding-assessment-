using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CodingAssessment.Api.DTOs;
using CodingAssessment.Api.Services;

namespace CodingAssessment.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CodeController : ControllerBase
    {
        private readonly IExecutionService _executionService;

        public CodeController(IExecutionService executionService)
        {
            _executionService = executionService;
        }

        [HttpPost("run")]
        public async Task<IActionResult> RunSampleCode([FromBody] RunCodeRequestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _executionService.RunSampleCodeAsync(dto);
            return Ok(result);
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitSolution([FromBody] SubmitCodeRequestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var candidateId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(candidateId))
            {
                return Unauthorized();
            }

            var (success, message, result) = await _executionService.SubmitSolutionAsync(dto, candidateId);
            if (!success)
            {
                return BadRequest(new { message });
            }

            return Ok(result);
        }
    }
}
