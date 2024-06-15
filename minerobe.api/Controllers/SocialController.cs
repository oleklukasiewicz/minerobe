using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Services.Interface;

namespace minerobe.api.Controllers
{
    [Route("Social")]
    [Authorize]
    public class SocialController : Controller
    {
        private readonly ISocialService _socialService;
        public SocialController(ISocialService socialService)
        {
            _socialService = socialService;
        }
        [HttpPost("Share/{id}")]
        public async Task<IActionResult> Share(Guid id)
        {
            var res = await _socialService.Share(id);
            if (res == null)
                return NotFound();
            return Ok(res);
        }
        [HttpPost("Unshare/{id}")]
        public async Task<IActionResult> Unshare(Guid id)
        {
            var res = await _socialService.Unshare(id);
            if (res==null)
                return NotFound();
            return Ok(res);
        }
        [HttpPost("Download/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Download(Guid id)
        {
            var res = await _socialService.Download(id);
            if (res == null)
                return NotFound();
            return Ok(res);
        }
        [HttpGet("User/{userId}")]
        public async Task<IActionResult> GetUserSummary(Guid userId)
        {
            var res = await _socialService.GetUserSummary(userId);
            if (res == null)
                return NotFound();
            return Ok(res);
        }
    }
}
