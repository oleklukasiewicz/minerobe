using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Services.Interface;

namespace minerobe.api.Controllers
{
    [Route("Test")]
    [AllowAnonymous]
    public class TestController : Controller
    {
        private readonly IJavaXboxAuthService _javaXboxAuthService;
        public TestController(IJavaXboxAuthService javaXboxAuthService)
        {
            _javaXboxAuthService = javaXboxAuthService;
        }
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            //var response = await _javaXboxAuthService.Authenticate();
            return Ok();
        }
        [HttpGet("Refresh/{token}")]
        public async Task<IActionResult> Refresh(string token)
        {
            //var response = await _javaXboxAuthService.Refresh(token);
            return Ok();
        }

    }
}
