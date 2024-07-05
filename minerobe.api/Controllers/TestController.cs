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
        public IActionResult Index()
        {
           _javaXboxAuthService.Authenticate();
            return Ok();
        }
        [HttpGet("Response")]
        public IActionResult Response([FromQuery]string code,[FromQuery]string state)
        {
           
            return Ok();
        }
    }
}
