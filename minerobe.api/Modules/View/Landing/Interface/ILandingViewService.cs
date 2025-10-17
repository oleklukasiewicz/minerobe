using minerobe.api.Modules.Core.PackageAgregation.Entity;
using minerobe.api.Modules.Core.User.Entity;

namespace minerobe.api.Modules.View.Landing.Interface
{
    public interface ILandingViewService
    {
        Task<IQueryable<OutfitPackageAgregationResponse>> GetMostDownloaded(MinerobeUser? user);
        Task<IQueryable<OutfitPackageAgregationResponse>> GetMostLiked(MinerobeUser? user);
        Task<IQueryable<OutfitPackageAgregationResponse>> GetMostRecent(MinerobeUser? user);
    }
}