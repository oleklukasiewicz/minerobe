using minerobe.api.Database;
using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.Package.Interface;
using minerobe.api.Modules.Core.PackageAgregation.Entity;
using minerobe.api.Modules.Core.PackageAgregation.Interface;
using minerobe.api.Modules.Core.User.Entity;
using minerobe.api.Modules.View.Landing.Interface;

namespace minerobe.api.Modules.View.Landing.Service
{
    public class LandingViewService : ILandingViewService
    {
        private readonly IPackageService _packageService;
        private readonly BaseDbContext _context;
        private readonly IOutfitPackageAgregationService _outfitPackageAgregationService;
        public LandingViewService(IPackageService packageService, BaseDbContext context, IOutfitPackageAgregationService outfitPackageAgregationService)
        {
            _packageService = packageService;
            _context = context;
            _outfitPackageAgregationService = outfitPackageAgregationService;
        }
        public async Task<IQueryable<OutfitPackageAgregationResponse>> GetMostRecent(MinerobeUser? user)
        {
            var agregations = _outfitPackageAgregationService.GetAgregation();
            var filter = agregations.Where(x => x.IsShared).OrderByDescending(x => x.ModifiedAt == null ? x.CreatedAt : x.ModifiedAt);
            var packages = _outfitPackageAgregationService.FromAgregationWithUserContext(filter, user?.WardrobeId);
            return packages;
        }
        public async Task<IQueryable<OutfitPackageAgregationResponse>> GetMostLiked(MinerobeUser? user)
        {
            var agregations = _outfitPackageAgregationService.GetAgregation();
            var filter = agregations.Where(x => x.IsShared).OrderByDescending(x => x.Likes);
            var packages = _outfitPackageAgregationService.FromAgregationWithUserContext(filter, user?.WardrobeId);
            return packages;
        }
        public async Task<IQueryable<OutfitPackageAgregationResponse>> GetMostDownloaded(MinerobeUser? user)
        {
            var agregations = _outfitPackageAgregationService.GetAgregation();
            var filter = agregations.Where(x => x.IsShared).OrderByDescending(x => x.Downloads);
            var packages = _outfitPackageAgregationService.FromAgregationWithUserContext(filter, user?.WardrobeId);
            return packages;
        }
    }
}
