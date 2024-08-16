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
        public LandingViewController(ILandingViewService landingViewService, IPackageService packageService)
        {
            _packageService = packageService;
            _landingViewService = landingViewService;
        }
        [HttpPost("recent")]
        public async Task<IActionResult> GetMostRecent([FromBody]PagedOptions<SimpleFilter> options)
        {
            var packages = await _landingViewService.GetMostRecent();
            var packagesPage = packages.Where(x => x.IsShared == true).ToPagedResponse(options.Page, options.PageSize);

            var items = new List<OutfitPackageListItemResponseModel>();
            foreach (var item in packagesPage.Items)
            {
                var package = await _packageService.GetById(item.PackageId);
                items.Add(package.ToListItemResponseModel());
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

            var items = new List<OutfitPackageListItemResponseModel>();
            foreach (var item in packagesPage.Items)
            {
                var package = await _packageService.GetById(item.PackageId);
                items.Add(package.ToListItemResponseModel());
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

            var items = new List<OutfitPackageListItemResponseModel>();
            foreach (var item in packagesPage.Items)
            {
                var package = await _packageService.GetById(item.PackageId);
                items.Add(package.ToListItemResponseModel());
            }

            var mappedRespose = packagesPage.MapResponseOptions<OutfitPackageView, OutfitPackageListItemResponseModel>();
            mappedRespose.Items = items;

            return Ok(mappedRespose);
        }
    }
}
