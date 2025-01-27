using minerobe.api.Entity.Agregation;
using minerobe.api.Helpers.Model;
using minerobe.api.Modules.Core.Package.ResponseModel;
using minerobe.api.Modules.Core.User.Entity;

namespace minerobe.api.ServicesHelpers.Interface
{
    public interface IOutfitPackageServiceHelper
    {
        Task<List<OutfitPackageListItemResponseModel>> AddUserContextToPage(PagedResponse<OutfitPackageAgregation> page, MinerobeUser userId = null, int maxLayerCount = 2);
        Task<List<OutfitPackageListItemResponseModel>> ToOutfitPackage(PagedResponse<OutfitPackageAgregation> page, int maxLayerCount = 2);
        Task<List<OutfitPackageListItemResponseModel>> ToOutfitPackageSingleLayer(PagedResponse<OutfitPackageAgregation> page, bool isInWardrobe = false);
    }
}