using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Services.Interface;

namespace minerobe.api.Controllers
{
    [Route("Test")]
    [AllowAnonymous]
    public class TestController : Controller
    {
        private readonly IJavaXboxAuthAltService _javaXboxAuthService;
        public TestController(IJavaXboxAuthAltService javaXboxAuthService)
        {
            _javaXboxAuthService = javaXboxAuthService;
        }
        [HttpGet]
        public IActionResult Index()
        {
          var url= _javaXboxAuthService.BeginFlow();
            return Ok(url);
        }
        [HttpGet("Response")]
        public async Task<IActionResult> Response([FromQuery]string code,[FromQuery]string state)
        {
           
            var response = await _javaXboxAuthService.Authenticate(code,state);
            return Ok();
        }
    }
}
