using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Services.Interface;

namespace minerobe.api.Controllers.Integration
{
    [Route("JavaXboxAuth")]
    public class JavaXboxAuthController : Controller
    {
        private readonly IUserService _userService;
        private readonly IJavaXboxAuthService _javaXboxAuthService;
        public JavaXboxAuthController(IUserService userService, IJavaXboxAuthService javaXboxAuthService)
        {
            _userService = userService;
            _javaXboxAuthService = javaXboxAuthService;
        }
        
        [HttpGet("Link")]
        public async Task<IActionResult> Auth()
        {
            var user = await _userService.GetFromToken(User);

            var profile=await _javaXboxAuthService.LinkAccount(user);
            return Ok(profile);
        }
        [HttpGet("Profile")]
        public async Task<IActionResult> GetProfile()
        {
            var user = await _userService.GetFromToken(User);

            var profile=await _javaXboxAuthService.GetProfile(user);
            return Ok(profile);
        }
    }
}
