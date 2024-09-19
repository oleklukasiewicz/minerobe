using minerobe.api.Entity.Summary;
using minerobe.api.Entity.User;
using minerobe.api.Helpers.Model;
using minerobe.api.ResponseModel.Package;
using minerobe.api.Services;
using minerobe.api.Services.Interface;
using minerobe.api.ServicesHelpers.Interface;

namespace minerobe.api.ServicesHelpers
{
    public class OutfitPackageServiceHelper : IOutfitPackageServiceHelper
    {
        private readonly IWardrobeService _wardrobeService;
        private readonly IPackageService _packageService;
        private readonly IUserService _userService;
        public OutfitPackageServiceHelper(IWardrobeService wardrobeService, IPackageService packageService, IUserService userService)
        {
            _wardrobeService = wardrobeService;
            _packageService = packageService;
            _userService = userService;
        }
        public async Task<List<OutfitPackageListItemResponseModel>> AddUserContextToPage(PagedResponse<OutfitPackageAgregation> page, MinerobeUser user = null)
        {
            var items = new List<OutfitPackageListItemResponseModel>();
            foreach (var item in page.Items)
            {
                var package = await _packageService.GetById(item.PackageId, null, true);

                var isInwadrobe = false;
                if (user != null)
                    isInwadrobe = await _wardrobeService.IsPackageInWardrobe(user.WardrobeId, item.PackageId);
                items.Add(package.ToListItemResponseModel(2, 1, isInwadrobe));
            }
            return items;
        }
        public async Task<List<OutfitPackageListItemResponseModel>> ToOutfitPackage(PagedResponse<OutfitPackageAgregation> page)
        {
            var items = new List<OutfitPackageListItemResponseModel>();
            foreach (var item in page.Items)
            {
                var package = await _packageService.GetById(item.PackageId, null, true);
                items.Add(package.ToListItemResponseModel(2, 1, false));
            }
            return items;
        }
        public async Task<List<OutfitPackageListItemResponseModel>> ToOutfitPackageSingleLayer(PagedResponse<OutfitPackageAgregation> page, bool isInWardrobe = false)
        {
            var items = new List<OutfitPackageListItemResponseModel>();
            foreach (var item in page.Items)
            {
                if (item.VariantId == null)
                    continue;
                var package = await _packageService.GetById(item.PackageId, item.VariantId.Value);
                items.Add(package.ToListItemResponseModel(2, 1, isInWardrobe));
            }
            return items;
        }

    }
}
