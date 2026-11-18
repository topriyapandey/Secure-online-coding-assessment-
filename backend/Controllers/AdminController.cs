using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CodingAssessment.Api.Models;
using CodingAssessment.Api.Services;

namespace CodingAssessment.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = AppRoles.Administrator)]
    public class AdminController : ControllerBase
    {
        private readonly IResultService _resultService;

        public AdminController(IResultService resultService)
        {
            _resultService = resultService;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var stats = await _resultService.GetAdminDashboardStatsAsync();
            return Ok(stats);
        }

        [HttpGet("candidates")]
        public async Task<IActionResult> GetCandidates()
        {
            var candidates = await _resultService.GetAllCandidatesAsync();
            return Ok(candidates);
        }

        [HttpGet("submissions")]
        public async Task<IActionResult> GetSubmissions([FromQuery] int? assessmentId)
        {
            var submissions = await _resultService.GetAllSubmissionsAsync(assessmentId);
            return Ok(submissions);
        }
    }
}
