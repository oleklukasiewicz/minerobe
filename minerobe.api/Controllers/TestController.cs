using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Services.Interface;
using System.Diagnostics;

namespace minerobe.api.Controllers
{
    [Route("Test")]
    [AllowAnonymous]
    public class TestController : Controller
    {
        private readonly IJavaXboxAuthService _javaXboxAuthService;
        private readonly IPackageService _packageService;
        public TestController(IJavaXboxAuthService javaXboxAuthService,IPackageService packageService)
        {
            _javaXboxAuthService = javaXboxAuthService;
            _packageService = packageService;
        }
        [HttpGet]
        public async Task<IActionResult> Index()
        {
          
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
