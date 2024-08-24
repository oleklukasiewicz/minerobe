using minerobe.api.Entity.Summary;
using minerobe.api.Helpers.Model;
using minerobe.api.ResponseModel.Package;

namespace minerobe.api.ServicesHelpers.Interface
{
    public interface IOutfitPackageServiceHelper
    {
        Task<List<OutfitPackageListItemResponseModel>> AddUserContextToPage(PagedResponse<OutfitPackageSummary> page, Guid? userId=null);
    }
}