using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Services.Interface;

namespace minerobe.api.Controllers.Integration
{
    [Route("JavaXboxAuth")]
    [Authorize]
    public class JavaXboxAuthController : Controller
    {
        private readonly IUserService _userService;
        private readonly IJavaXboxAuthService _javaXboxAuthService;
        public JavaXboxAuthController(IUserService userService,IJavaXboxAuthService javaXboxAuthService)
        {
            _userService = userService;
            _javaXboxAuthService = javaXboxAuthService;
        }
        [HttpPost("Link")]
        public async Task<IActionResult> Link()
        {
            var user = _userService.GetFromExternalUser(User);
            return Ok();
        }
        [HttpGet("Status")]
        public async Task<IActionResult> Status()
        {
            var user = _userService.GetFromExternalUser(User);
            return Ok();
        }
        [HttpPost("Unlink")]
        public async Task<IActionResult> Unlink()
        {
            var user = _userService.GetFromExternalUser(User);
            return Ok();
        }
        [HttpGet("Profile")]
        public async Task<IActionResult> Profile()
        {
            var user = _userService.GetFromExternalUser(User);
            return Ok();
        }
    }
}
