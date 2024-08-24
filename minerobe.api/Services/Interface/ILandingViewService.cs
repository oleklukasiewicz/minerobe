using minerobe.api.Entity.Summary;

namespace minerobe.api.Services.Interface
{
    public interface ILandingViewService
    {
        Task<IQueryable<OutfitPackageSummary>> GetMostDownloaded();
        Task<IQueryable<OutfitPackageSummary>> GetMostLiked();
        Task<IQueryable<OutfitPackageSummary>> GetMostRecent();
    }
}