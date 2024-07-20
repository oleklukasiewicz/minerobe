using minerobe.api.Entity.Integration;
using minerobe.api.Entity.Package;
using minerobe.api.Entity.User;

namespace minerobe.api.Services.Interface
{
    public interface IJavaXboxAuthService
    {
        Task<JavaXboxProfile> GetProfile(MinerobeUser user);
        Task<JavaXboxProfile> LinkAccount(MinerobeUser user);
        Task<string> GetUserCurrentSkin(Guid userId);
        Task<bool> UnLinkAccount(MinerobeUser user);
        Task<bool> SetUserSkin(Guid userId, ModelType model);
        Task<bool> SetUserCape(Guid userId, Guid capeId);
        Task<bool> HideUserCape(Guid userId);
    }
}