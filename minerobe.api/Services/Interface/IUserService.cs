using minerobe.api.Entity.User;
using System.Security.Claims;

namespace minerobe.api.Services.Interface
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
    }
}