using minerobe.api.Entity.Summary;
using minerobe.api.Entity.User;
using minerobe.api.Helpers.Model;
using minerobe.api.ResponseModel.Package;
using System.Threading.Tasks;

namespace minerobe.api.ServicesHelpers.Interface
{
    public interface IOutfitPackageServiceHelper
    {
        Task<List<OutfitPackageListItemResponseModel>> AddUserContextToPage(PagedResponse<OutfitPackageAgregation> page, Guid? userId=null);
        Task<List<OutfitPackageListItemResponseModel>> AddUserContextToPage(PagedResponse<OutfitPackageAgregation> page, MinerobeUser userId = null);
        Task<List<OutfitPackageListItemResponseModel>> ToOutfitPackage(PagedResponse<OutfitPackageAgregation> page);
        Task<List<OutfitPackageListItemResponseModel>> ToOutfitPackageSingleLayer(PagedResponse<OutfitPackageAgregation> page,bool isInWardrobe=false);
    }
}