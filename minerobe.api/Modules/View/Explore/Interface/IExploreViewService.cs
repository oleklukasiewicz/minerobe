using minerobe.api.Helpers.Filter;
using minerobe.api.Modules.Core.PackageAgregation.Entity;
using minerobe.api.Modules.Core.User.Entity;

namespace minerobe.api.Modules.View.Explore.Interface
{
    public interface IExploreViewService
    {
        Task<IQueryable<OutfitPackageAgregationResponse>> GetExplorePackages(ExploreOutfitFilter filter, MinerobeUser user);
    }
}