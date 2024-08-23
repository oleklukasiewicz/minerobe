using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Entity.Package;
using minerobe.api.Helpers;
using minerobe.api.Helpers.Filter;
using minerobe.api.Helpers.Model;
using minerobe.api.ResponseModel.Package;
using minerobe.api.Services.Interface;

namespace minerobe.api.Controllers.View
{
    [AllowAnonymous]
    [Route("LandingView")]
    public class LandingViewController : Controller
    {
        private readonly ILandingViewService _landingViewService;
        private readonly IPackageService _packageService;
        private readonly IWardrobeService _wardrobeService;
        private readonly IUserService _userService;
        public LandingViewController(ILandingViewService landingViewService, IPackageService packageService, IWardrobeService wardrobeService, IUserService userService)
        {
            _packageService = packageService;
            _landingViewService = landingViewService;
            _userService = userService;
            _wardrobeService = wardrobeService;
        }
        [HttpPost("recent")]
        public async Task<IActionResult> GetMostRecent([FromBody]PagedOptions<SimpleFilter> options)
        {
            var packages = await _landingViewService.GetMostRecent();
            var packagesPage = packages.Where(x => x.IsShared == true).ToPagedResponse(options.Page, options.PageSize);
            var user = await _userService.GetFromExternalUser(User);

            var items = new List<OutfitPackageListItemResponseModel>();
            foreach (var item in packagesPage.Items)
            {
                var package = await _packageService.GetById(item.PackageId);

                var isInwadrobe = false;
                if(user != null)
                    isInwadrobe = await _wardrobeService.IsPackageInWardrobe(user.Id, item.PackageId);
                items.Add(package.ToListItemResponseModel(2,isInwadrobe));
            }

            var mappedRespose = packagesPage.MapResponseOptions<OutfitPackageView, OutfitPackageListItemResponseModel>();
            mappedRespose.Items = items;

            return Ok(mappedRespose);
        }
        [HttpPost("liked")]
        public async Task<IActionResult> GetMostLiked([FromBody]PagedOptions<SimpleFilter> options)
        {
            var packages = await _landingViewService.GetMostLiked();
            var packagesPage = packages.Where(x => x.IsShared == true).ToPagedResponse(options.Page, options.PageSize);
            var user = await _userService.GetFromExternalUser(User);


            var items = new List<OutfitPackageListItemResponseModel>();
            foreach (var item in packagesPage.Items)
            {
                var package = await _packageService.GetById(item.PackageId);

                var isInwadrobe = false;
                if (user != null)
                    isInwadrobe = await _wardrobeService.IsPackageInWardrobe(user.Id, item.PackageId);
                items.Add(package.ToListItemResponseModel(2,isInwadrobe));
            }

            var mappedRespose = packagesPage.MapResponseOptions<OutfitPackageView, OutfitPackageListItemResponseModel>();
            mappedRespose.Items = items;

            return Ok(mappedRespose);
        }
        [HttpPost("downloaded")]
        public async Task<IActionResult> GetMostDownloaded([FromBody] PagedOptions<SimpleFilter> options)
        {
            var packages = await _landingViewService.GetMostDownloaded();
            var packagesPage = packages.Where(x => x.IsShared == true).ToPagedResponse(options.Page, options.PageSize);
            var user = await _userService.GetFromExternalUser(User);


            var items = new List<OutfitPackageListItemResponseModel>();
            foreach (var item in packagesPage.Items)
            {
                var package = await _packageService.GetById(item.PackageId);

                var isInwadrobe = false;
                if (user != null)
                    isInwadrobe = await _wardrobeService.IsPackageInWardrobe(user.Id, item.PackageId);
                items.Add(package.ToListItemResponseModel(2,isInwadrobe));
            }

            var mappedRespose = packagesPage.MapResponseOptions<OutfitPackageView, OutfitPackageListItemResponseModel>();
            mappedRespose.Items = items;

            return Ok(mappedRespose);
        }
    }
}
