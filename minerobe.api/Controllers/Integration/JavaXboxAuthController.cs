using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Services.Interface;

namespace minerobe.api.Controllers.Integration
{
    [Route("JavaXboxAuth")]
    [AllowAnonymous]
    public class JavaXboxAuthController : Controller
    {
        private readonly IUserService _userService;
        private readonly IJavaXboxAuthService _javaXboxAuthService;
        public JavaXboxAuthController(IUserService userService, IJavaXboxAuthService javaXboxAuthService)
        {
            _userService = userService;
            _javaXboxAuthService = javaXboxAuthService;
        }
        
        [HttpGet("Auth")]
        public IActionResult Auth()
        {
            var user = _userService.GetFromToken(User);

            _javaXboxAuthService.Authenticate();
            return Ok();
        }
        [HttpGet("Redirect"),AllowAnonymous]
        public async Task<IActionResult> Redirect([FromQuery]string code, [FromQuery]string state)
        {
            //var response = await _javaXboxAuthService.Authenticate(code, state);
            return Ok();
        }
        [HttpPut("Redirect"), AllowAnonymous]
        public async Task<IActionResult> Redirect()
        {
           var refreshToken = Request.Headers["msRefresh"];
            //var response = _javaXboxAuthService.Refresh(refreshToken);
            return Ok();
        }


    }
}
