using minerobe.api.Entity.Agregation;

namespace minerobe.api.Modules.View.Landing.Interface
{
    public interface ILandingViewService
    {
        Task<IQueryable<OutfitPackageAgregation>> GetMostDownloaded();
        Task<IQueryable<OutfitPackageAgregation>> GetMostLiked();
        Task<IQueryable<OutfitPackageAgregation>> GetMostRecent();
    }
}