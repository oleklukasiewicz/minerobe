using minerobe.api.Modules.Core.User.Entity;
using System.Security.Claims;

namespace minerobe.api.Modules.Core.User.Interface
{
    public interface IUserService
    {
        Task<MinerobeUser> Add(MinerobeUser user);
        Task<MinerobeUser> GetById(Guid id);
        Task<MinerobeUser> GetByName(string name);
        Task<MinerobeUser> Update(MinerobeUser user);
        Task<MinerobeUser> Login(ClaimsPrincipal externalUser);
        Task<MinerobeUser> GetFromExternalId(string externalId);
        Task<MinerobeUser> GetFromExternalUser(ClaimsPrincipal externalUser);

        Task<MinerobeUser> GetUserOfWardrobe(Guid wardrobeId);
        Task<MinerobeUser> ResetAvatar(ClaimsPrincipal externalUser);
        // alias
        Task<MinerobeUser> GetFromToken(ClaimsPrincipal externalUser);
    }
}