using Microsoft.EntityFrameworkCore;
using minerobe.api.Database;
using minerobe.api.Modules.Core.Settings.Entity;
using minerobe.api.Modules.Core.User.Entity;
using minerobe.api.Modules.Core.User.Interface;
using System.Security.Claims;

namespace minerobe.api.Modules.Core.User.Service
{
    public class UserService : IUserService
    {
        private readonly BaseDbContext _context;
        public UserService(BaseDbContext context)
        {
            _context = context;
        }
        public async Task<MinerobeUser> Add(MinerobeUser user)
        {
            user.Id = Guid.NewGuid();
            var res = await _context.MinerobeUsers.AddAsync(user);
            await _context.SaveChangesAsync();
            return await GetById(user.Id);
        }
        public async Task<MinerobeUser> GetByName(string name)
        {
            return await _context.MinerobeUsers.Where(x => x.Name == name).FirstOrDefaultAsync();
        }
        public async Task<MinerobeUser> GetById(Guid id)
        {
            return await _context.MinerobeUsers.Where(x => x.Id == id).FirstOrDefaultAsync();
        }
        public async Task<MinerobeUser> Update(MinerobeUser user)
        {
            var old = await _context.MinerobeUsers.Where(x => x.Id == user.Id).FirstOrDefaultAsync();
            if (old == null)
                return null;

            old.Name = user.Name;
            old.Avatar = user.Avatar;

            await _context.SaveChangesAsync();
            return old;
        }
        public async Task<MinerobeUser> GetFromExternalId(string externalId)
        {
            var link = await _context.MinerobeUserLinks.Where(x => x.ExternalId == externalId).FirstOrDefaultAsync();
            if (link == null)
                return null;
            return await _context.MinerobeUsers.Where(x => x.Id == link.MinerobeUserId).FirstOrDefaultAsync();
        }
        public async Task<MinerobeUser> GetFromExternalUser(ClaimsPrincipal externalUser)
        {
            if (!externalUser.Identity.IsAuthenticated)
                return new MinerobeUser();

            var externalId = externalUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            var link = await _context.MinerobeUserLinks.Where(x => x.ExternalId == externalId).FirstOrDefaultAsync();
            if (link == null)
                return null;
            return await _context.MinerobeUsers.Where(x => x.Id == link.MinerobeUserId).FirstOrDefaultAsync();
        }
        public async Task<MinerobeUser> Login(ClaimsPrincipal externalUser)
        {
            var externalId = externalUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            var user = await GetFromExternalId(externalId);
            if (user != null)
                return user;

            var newUser = await CreateNewUser(externalUser);

            return newUser;
        }

        public async Task<MinerobeUser> GetUserOfWardrobe(Guid wardrobeId)
        {
            var user = await _context.MinerobeUsers.Where(x => x.WardrobeId == wardrobeId).FirstOrDefaultAsync();
            return user;
        }


        //alias
        public async Task<MinerobeUser> GetFromToken(ClaimsPrincipal externalUser)
        {
            return await GetFromExternalUser(externalUser);
        }

        private async Task<MinerobeUser> CreateNewUser(ClaimsPrincipal externalUser)
        {
            var externalId = externalUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            var name = externalUser.FindFirst("name").Value;
            var avatar = externalUser.FindFirst("picture").Value;
            //downloading image
            using (var client = new HttpClient())
            {
                var response = await client.GetAsync(avatar);
                if (response.IsSuccessStatusCode)
                {
                    var bytes = await response.Content.ReadAsByteArrayAsync();
                    avatar = "data:image/png;base64," + Convert.ToBase64String(bytes);
                }
            }

            var newUser = new MinerobeUser
            {
                Name = name,
                Id = Guid.NewGuid(),
                Avatar = avatar,
                WardrobeId = Guid.NewGuid()
            };
            await Add(newUser);
            var link = new MinerobeUserLink
            {
                ExternalId = externalId,
                MinerobeUserId = newUser.Id
            };

            await _context.MinerobeUserLinks.AddAsync(link);

            //creating settings
            var settings = new UserSettings
            {
                Id = Guid.NewGuid(),
                OwnerId = newUser.Id,
                CurrentTexturePackageId = null,
                CreatedAt = DateTime.Now
            };
            _context.UserSettings.Add(settings);

            await _context.SaveChangesAsync();
            return newUser;
        }

    }
}
