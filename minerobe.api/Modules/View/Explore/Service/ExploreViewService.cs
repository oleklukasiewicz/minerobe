using minerobe.api.Helpers.Filter;
using minerobe.api.Modules.Core.PackageAgregation.Entity;
using minerobe.api.Modules.Core.PackageAgregation.Interface;
using minerobe.api.Modules.Core.User.Entity;
using minerobe.api.Modules.View.Explore.Interface;

namespace minerobe.api.Modules.View.Explore.Service
{
    public class ExploreViewService : IExploreViewService
    {
        private readonly IOutfitPackageAgregationService _outfitPackageAgregationService;
        public ExploreViewService(IOutfitPackageAgregationService outfitPackageAgregationService)
        {
            _outfitPackageAgregationService = outfitPackageAgregationService;
        }
        public async Task<IQueryable<OutfitPackageAgregationResponse>> GetExplorePackages(ExploreOutfitFilter filter, MinerobeUser user)
        {
            var agregations = _outfitPackageAgregationService.GetAgregation();
            var filteredAgregations = filter.Filter(agregations);
            var packages = _outfitPackageAgregationService.FromAgregationWithUserContext(filteredAgregations, user?.WardrobeId);
            return packages;
        }
    }
}
