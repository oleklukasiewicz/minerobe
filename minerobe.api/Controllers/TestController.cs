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
            var watch = System.Diagnostics.Stopwatch.StartNew();
            // the code that you want to measure comes here
            
            await _packageService.GetById(Guid.Parse("7A5EA9C1-029C-4339-B014-DD54A60DE8B5"));
            watch.Stop();
            var elapsedMs = watch.ElapsedMilliseconds;
            var watch2 = System.Diagnostics.Stopwatch.StartNew();
            await _packageService.GetPackageSnapshot(Guid.Parse("7A5EA9C1-029C-4339-B014-DD54A60DE8B5"));
            watch2.Stop();
            var elapsedMs2 = watch2.ElapsedMilliseconds;
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
