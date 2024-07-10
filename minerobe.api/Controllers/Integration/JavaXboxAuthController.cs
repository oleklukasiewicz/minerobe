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
        private readonly IJavaXboxAuthAltService _javaXboxAuthService;
        public JavaXboxAuthController(IUserService userService, IJavaXboxAuthAltService javaXboxAuthService)
        {
            _userService = userService;
            _javaXboxAuthService = javaXboxAuthService;
        }
        
        [HttpGet("Auth"),AllowAnonymous]
        public IActionResult Auth()
        {
            var url = _javaXboxAuthService.BeginFlow();
            return Ok(url);
        }
        [HttpGet("Redirect"),AllowAnonymous]
        public async Task<IActionResult> Redirect([FromQuery]string code, [FromQuery]string state)
        {
            var response = await _javaXboxAuthService.Authenticate(code, state);
            return Ok(response);
        }
        [HttpPut("Redirect"), AllowAnonymous]
        public async Task<IActionResult> Redirect()
        {
           var refreshToken = Request.Headers["msRefresh"];
            var response = _javaXboxAuthService.Refresh(refreshToken);
            return Ok(response);
        }


    }
}
