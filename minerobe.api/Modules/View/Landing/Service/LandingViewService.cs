using minerobe.api.Modules.Core.PackageAgregation.Entity;
using minerobe.api.Modules.Core.PackageAgregation.Interface;
using minerobe.api.Modules.Core.User.Entity;
using minerobe.api.Modules.View.Landing.Interface;

namespace minerobe.api.Modules.View.Landing.Service
{
    public class LandingViewService : ILandingViewService
    {
        private readonly IOutfitPackageAgregationService _outfitPackageAgregationService;
        public LandingViewService(IOutfitPackageAgregationService outfitPackageAgregationService)
        {
            _outfitPackageAgregationService = outfitPackageAgregationService;
        }
        public async Task<IQueryable<OutfitPackageAgregationResponse>> GetMostRecent(MinerobeUser? user)
        {
            var agregations = _outfitPackageAgregationService.GetAgregation();
            var filter = agregations.Where(x => x.IsShared);
            var packages = _outfitPackageAgregationService.FromAgregationWithUserContext(filter, user?.WardrobeId);
            return packages.OrderByDescending(x => x.Package.CreatedAt == null ? x.Package.CreatedAt : x.Package.ModifiedAt);
        }
        public async Task<IQueryable<OutfitPackageAgregationResponse>> GetMostLiked(MinerobeUser? user)
        {
            var agregations = _outfitPackageAgregationService.GetAgregation();
            var filter = agregations.Where(x => x.IsShared);
            var packages = _outfitPackageAgregationService.FromAgregationWithUserContext(filter, user?.WardrobeId);
            return packages.OrderByDescending(x => x.Package.Social.Likes);
        }
        public async Task<IQueryable<OutfitPackageAgregationResponse>> GetMostDownloaded(MinerobeUser? user)
        {
            var agregations = _outfitPackageAgregationService.GetAgregation();
            var filter = agregations.Where(x => x.IsShared);
            var packages = _outfitPackageAgregationService.FromAgregationWithUserContext(filter, user?.WardrobeId);
            return packages.OrderByDescending(x => x.Package.Social.Downloads);
        }
    }
}
