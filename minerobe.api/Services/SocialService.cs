using Microsoft.EntityFrameworkCore;
using minerobe.api.Database;
using minerobe.api.Entity;
using minerobe.api.Services.Interface;

namespace minerobe.api.Services
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
        public async Task<SocialData> Like(Guid socialId)
        {
            var social = await _context.SocialDatas.Where(x => x.Id == socialId).FirstOrDefaultAsync();
            if (social == null)
                return null;
            social.Likes++;
            _context.SocialDatas.Update(social);
            await _context.SaveChangesAsync();
            return social;
        }
        public async Task<SocialData> Unlike(Guid socialId)
        {
            var social = await _context.SocialDatas.Where(x => x.Id == socialId).FirstOrDefaultAsync();
            if (social == null)
                return null;

            if (social.Likes > 0)
                social.Likes--;
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
        public async Task<Guid> CreateSocialEntry()
        {
            var social = new SocialData();
            social.Id = Guid.NewGuid();
            await _context.SocialDatas.AddAsync(social);
            await _context.SaveChangesAsync();
            return social.Id;
        }
        public async Task<SocialData> GetById(Guid socialId)
        {
            return await _context.SocialDatas.Where(x => x.Id == socialId).FirstOrDefaultAsync();
        }
        public async Task<SocialData> GetUserSummary(Guid userId)
        {
            //get all packages with publiher id
            var packages = await _context.OutfitPackages.Where(x => x.PublisherId == userId).ToListAsync();
            var socialDatas = new List<SocialData>();

            foreach (var package in packages)
            {
                var social = await _context.SocialDatas.Where(x => x.Id == package.SocialDataId).FirstOrDefaultAsync();
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
