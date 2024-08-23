using minerobe.api.Entity.Package;
using minerobe.api.Helpers.Model;
using minerobe.api.ResponseModel.Package;

namespace minerobe.api.ServicesHelpers.Interface
{
    public interface IOutfitPackageServiceHelper
    {
        Task<List<OutfitPackageListItemResponseModel>> AddUserContextToPage(PagedResponse<OutfitPackageView> page, Guid? userId=null);
    }
}