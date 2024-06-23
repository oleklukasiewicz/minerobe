using minerobe.api.Entity.Package;

namespace minerobe.api.Services.Interface
{
    public interface ILandingViewService
    {
        Task<IQueryable<OutfitPackageView>> GetMostDownloaded();
        Task<IQueryable<OutfitPackageView>> GetMostLiked();
        Task<IQueryable<OutfitPackageView>> GetMostRecent();
    }
}