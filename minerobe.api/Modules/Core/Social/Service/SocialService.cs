using Microsoft.EntityFrameworkCore;
using minerobe.api.Database;
using minerobe.api.Modules.Core.Social.Entity;
using minerobe.api.Modules.Core.Social.Interface;

namespace minerobe.api.Modules.Core.Social.Service
{
    public class SocialService : ISocialService
    {
        private readonly BaseDbContext _context;
        public SocialService(BaseDbContext context)
        {
            _context = context;
        }
        public async Task<SocialData> Share(Guid socialId)
        {
            var social = await _context.SocialDatas.Where(x => x.Id == socialId).FirstOrDefaultAsync();
            if (social == null)
                return null;
            social.IsShared = true;
            _context.SocialDatas.Update(social);
            await _context.SaveChangesAsync();
            return social;
        }
        public async Task<SocialData> Unshare(Guid socialId)
        {
            var social = await _context.SocialDatas.Where(x => x.Id == socialId).FirstOrDefaultAsync();
            if (social == null)
                return null;
            social.IsShared = false;
            _context.SocialDatas.Update(social);
            await _context.SaveChangesAsync();
            return social;
        }
        public async Task<SocialData> Download(Guid socialId)
        {
            var social = await _context.SocialDatas.Where(x => x.Id == socialId).FirstOrDefaultAsync();
            if (social == null)
                return null;
            social.Downloads++;
            _context.SocialDatas.Update(social);
            await _context.SaveChangesAsync();
            return social;
        }
        public async Task<Guid> Add()
        {
            var social = new SocialData();
            social.Id = Guid.NewGuid();
            await _context.SocialDatas.AddAsync(social);
            await _context.SaveChangesAsync();
            return social.Id;
        }
        public async Task<SocialData> GetById(Guid socialId)
        {
            var socialEntry = await _context.SocialDatas.Where(x => x.Id == socialId).FirstOrDefaultAsync();
            var package = await _context.OutfitPackages.Where(x => x.SocialDataId == socialId).FirstOrDefaultAsync();
            if (package != null)
            {
                var likes = await _context.WardrobeMatchings.Where(x => x.OutfitPackageId == package.Id).CountAsync();
                socialEntry.Likes = likes;
                return socialEntry;
            }
            var collection = await _context.OutfitPackageCollections.Where(x => x.SocialDataId == socialId).FirstOrDefaultAsync();
            if (collection != null)
            {
                var likes = await _context.WardrobeCollectionMatchings.Where(x => x.OutfitPackageCollectionId == collection.Id).CountAsync();
                socialEntry.Likes = likes;
                return socialEntry;
            }
            return socialEntry;

        }
        public async Task<SocialData> GetUserSummary(Guid userId)
        {
            //get all packages with publiher id
            var packages = await _context.OutfitPackages.Where(x => x.PublisherId == userId).ToListAsync();
            var socialDatas = new List<SocialData>();

            foreach (var package in packages)
            {
                var social = await _context.SocialDatas.Where(x => x.Id == package.SocialDataId && x.IsShared == true).FirstOrDefaultAsync();
                if (social != null)
                    socialDatas.Add(social);
            }

            var summary = new SocialData();
            summary.Likes = socialDatas.Sum(x => x.Likes);
            summary.Downloads = socialDatas.Sum(x => x.Downloads);
            return summary;
        }
    }
}
