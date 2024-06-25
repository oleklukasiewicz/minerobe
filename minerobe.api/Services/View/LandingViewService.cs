using Microsoft.EntityFrameworkCore;
using minerobe.api.Database;
using minerobe.api.Entity.Package;
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
        public async Task<IQueryable<OutfitPackageView>> GetMostRecent()
        {
            var packages = _context.OutfitPackageViews.OrderByDescending(x => x.ModifiedAt == null ? x.CreatedAt : x.ModifiedAt).Take(6).AsQueryable();
            return packages;
        }
        public async Task<IQueryable<OutfitPackageView>> GetMostLiked()
        {
            var packages = _context.OutfitPackageViews.OrderByDescending(x => x.Likes).Take(6).AsQueryable();
            return packages;
        }
        public async Task<IQueryable<OutfitPackageView>> GetMostDownloaded()
        {
            var packages = _context.OutfitPackageViews.OrderByDescending(x => x.Downloads).Take(6).AsQueryable();
            return packages;
        }
    }
}
