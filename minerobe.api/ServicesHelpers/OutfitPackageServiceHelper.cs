using minerobe.api.Entity.Package;
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
        public OutfitPackageServiceHelper(IWardrobeService wardrobeService, IPackageService packageService)
        {
            _wardrobeService = wardrobeService;
            _packageService = packageService;
        }
        public async Task<List<OutfitPackageListItemResponseModel>> AddUserContextToPage(PagedResponse<OutfitPackageView> page, Guid? userId=null)
        {
            var items = new List<OutfitPackageListItemResponseModel>();
            foreach (var item in page.Items)
            {
                var package = await _packageService.GetById(item.PackageId);

                var isInwadrobe = false;
                if (userId != null)
                    isInwadrobe = await _wardrobeService.IsPackageInWardrobe(userId.Value, item.PackageId);
                items.Add(package.ToListItemResponseModel(2, isInwadrobe));
            }
            return items;
        }

    }
}
