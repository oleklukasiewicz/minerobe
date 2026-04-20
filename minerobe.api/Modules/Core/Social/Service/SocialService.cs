using Microsoft.EntityFrameworkCore;
using minerobe.api.Database;
using minerobe.api.Helpers.Model;
using minerobe.api.Modules.Core.Social.Entity;
using minerobe.api.Modules.Core.Social.Interface;
using minerobe.api.Modules.Core.User.Interface;

namespace minerobe.api.Modules.Core.Social.Service
{
    public class SocialService : ISocialService
    {
        private readonly BaseDbContext _context;
        private readonly IUserService _userService;
        public SocialService(BaseDbContext context, IUserService userService)
        {
            _context = context;
            _userService = userService;
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
            social.Likes = 1;
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
            return await _context.SocialDatas.Where(x => x.Id == socialId).FirstOrDefaultAsync();
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
        public async Task<PackageAccessModel> GetSocialAccess(Guid socialId)
        {
            var social = await _context.SocialDatas.Where(x => x.Id == socialId).FirstOrDefaultAsync();
            var package = await _context.OutfitPackages.Where(x => x.SocialDataId == socialId).FirstOrDefaultAsync();

            var res = new PackageAccessModel
            {
                PackageId = socialId,
                UserId = package.PublisherId,
                IsShared = social.IsShared
            };
            return res;
        }
        public async Task<bool> CanAccessSocial(Guid socialId, Guid userId)
        {
            var access = await GetSocialAccess(socialId);
            if (access == null)
                return false;
            if (access.IsShared == true)
                return true;
            if (access.UserId == userId)
                return true;

            var user = await _userService.GetById(userId);
            if (user == null)
                return false;
            if (user.IsAdmin)
                return true;
            return false;
        }
        public async Task<bool> CanEditSocial(Guid socialId, Guid userId)
        {
            var access = await GetSocialAccess(socialId);
            if (access == null)
                return false;
            if (access.UserId == userId)
                return true;

            var user = await _userService.GetById(userId);
            if (user == null)
                return false;
            if (user.IsAdmin)
                return true;
            return false;
        }
    }
}
