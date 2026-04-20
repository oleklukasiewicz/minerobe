using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Helpers;
using minerobe.api.Helpers.Filter;
using minerobe.api.Helpers.Model;
using minerobe.api.Modules.Core.User.Interface;
using minerobe.api.Modules.View.Explore.Interface;

namespace minerobe.api.Modules.View.Explore.Controllers
{
    [AllowAnonymous]
    [Route("ExploreView")]
    public class ExploreViewController : Controller
    {
        private readonly IExploreViewService _exploreViewService;
        private readonly IUserService _userService;
        public ExploreViewController(IExploreViewService exploreViewService, IUserService userService)
        {
            _exploreViewService = exploreViewService;
            _userService = userService;
        }
        [HttpPost("outfit")]
        public async Task<IActionResult> GetExplorePackages([FromBody] PagedModel<ExploreOutfitFilter> options)
        {
            var user = await _userService.GetFromExternalUser(User);
            var packages = await _exploreViewService.GetExplorePackages(options.Filter, user);

            var packagesPage = packages.ToPagedResponse(options);

            var items = packagesPage.ToOutfitPackageListItem();
            var mappedResponse = packagesPage.MapResponseOptions(items);

            return Ok(mappedResponse);
        }
    }
}
