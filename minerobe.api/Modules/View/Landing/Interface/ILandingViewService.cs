using minerobe.api.Entity.Summary;

namespace minerobe.api.Services.Interface
{
    public interface ILandingViewService
    {
        Task<IQueryable<OutfitPackageAgregation>> GetMostDownloaded();
        Task<IQueryable<OutfitPackageAgregation>> GetMostLiked();
        Task<IQueryable<OutfitPackageAgregation>> GetMostRecent();
    }
}