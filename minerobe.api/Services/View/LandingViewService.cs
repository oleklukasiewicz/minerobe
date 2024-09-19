using minerobe.api.Database;
using minerobe.api.Entity.Summary;
using minerobe.api.Services.Interface;

namespace minerobe.api.Services.View
{
    public class LandingViewService : ILandingViewService
    {
        private readonly IPackageService _packageService;
        private readonly BaseDbContext _context;
        public LandingViewService(IPackageService packageService, BaseDbContext context)
        {
            _packageService = packageService;
            _context = context;
        }
        public async Task<IQueryable<OutfitPackageAgregation>> GetMostRecent()
        {
            var packages = _context.OutfitPackageAgregations.OrderByDescending(x => x.ModifiedAt == null ? x.CreatedAt : x.ModifiedAt).AsQueryable();
            return packages;
        }
        public async Task<IQueryable<OutfitPackageAgregation>> GetMostLiked()
        {
            var packages = _context.OutfitPackageAgregations.OrderByDescending(x => x.Likes).AsQueryable();
            return packages;
        }
        public async Task<IQueryable<OutfitPackageAgregation>> GetMostDownloaded()
        {
            var packages = _context.OutfitPackageAgregations.OrderByDescending(x => x.Downloads).AsQueryable();
            return packages;
        }
    }
}
