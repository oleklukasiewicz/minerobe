using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Helpers;
using minerobe.api.Helpers.Filter;
using minerobe.api.Helpers.Model;
using minerobe.api.Modules.Core.Package.Interface;
using minerobe.api.Modules.Core.User.Interface;
using minerobe.api.Modules.View.Landing.Interface;

namespace minerobe.api.Modules.View.Landing.Controllers
{
    [AllowAnonymous]
    [Route("LandingView")]
    public class LandingViewController : Controller
    {
        private readonly ILandingViewService _landingViewService;
        private readonly IPackageService _packageService;
        private readonly IUserService _userService;
        public LandingViewController(ILandingViewService landingViewService, IPackageService packageService, IUserService userService)
        {
            _packageService = packageService;
            _landingViewService = landingViewService;
            _userService = userService;
        }
        [HttpPost("recent")]
        public async Task<IActionResult> GetMostRecent([FromBody] PagedModel<SimpleFilter> options)
        {
            var user = await _userService.GetFromExternalUser(User);

            var packages = await _landingViewService.GetMostRecent(user);
            var packagesPage = packages.ToPagedResponse(options);

            var items = packagesPage.AddUserContextToPage();

            var mappedRespose = packagesPage.MapResponseOptions(items);
            return Ok(mappedRespose);
        }
        [HttpPost("liked")]
        public async Task<IActionResult> GetMostLiked([FromBody] PagedModel<SimpleFilter> options)
        {
            var user = await _userService.GetFromExternalUser(User);

            var packages = await _landingViewService.GetMostLiked(user);
            var packagesPage = packages.ToPagedResponse(options);

            var items = packagesPage.AddUserContextToPage();

            var mappedRespose = packagesPage.MapResponseOptions(items);
            return Ok(mappedRespose);
        }
        [HttpPost("downloaded")]
        public async Task<IActionResult> GetMostDownloaded([FromBody] PagedModel<SimpleFilter> options)
        {
            var user = await _userService.GetFromExternalUser(User);

            var packages = await _landingViewService.GetMostDownloaded(user);
            var packagesPage = packages.ToPagedResponse(options);

            var items = packagesPage.AddUserContextToPage();

            var mappedRespose = packagesPage.MapResponseOptions(items);
            return Ok(mappedRespose);
        }
    }
}
