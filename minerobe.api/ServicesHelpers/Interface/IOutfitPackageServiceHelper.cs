using minerobe.api.Entity.Summary;
using minerobe.api.Entity.User;
using minerobe.api.Helpers.Model;
using minerobe.api.ResponseModel.Package;

namespace minerobe.api.ServicesHelpers.Interface
{
    public interface IOutfitPackageServiceHelper
    {
        Task<List<OutfitPackageListItemResponseModel>> AddUserContextToPage(PagedResponse<OutfitPackageAgregation> page, MinerobeUser userId = null, int maxLayerCount = 2);
        Task<List<OutfitPackageListItemResponseModel>> ToOutfitPackage(PagedResponse<OutfitPackageAgregation> page, int maxlayerCount = 2);
        Task<List<OutfitPackageListItemResponseModel>> ToOutfitPackageSingleLayer(PagedResponse<OutfitPackageAgregation> page, bool isInWardrobe = false);
    }
}