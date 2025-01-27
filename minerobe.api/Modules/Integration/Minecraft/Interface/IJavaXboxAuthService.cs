using minerobe.api.Entity.Package;
using minerobe.api.Entity.User;
using minerobe.api.Helpers.Integration;
using static minerobe.api.Services.Integration.JavaXboxAuthService;

namespace minerobe.api.Services.Interface
{
    public interface IJavaXboxAuthService
    {
        Task<JavaXboxProfile> GetProfile(MinerobeUser user, bool keepFresh = true);
        Task<JavaXboxProfile> LinkAccount(MinerobeUser user);
        Task<string> GetUserCurrentSkin(Guid userId);
        Task<bool> UnLinkAccount(MinerobeUser user);
        Task<bool> SetUserSkin(Guid userId, ModelType model);
        Task<bool> SetUserCape(Guid userId, Guid capeId);
        Task<bool> HideUserCape(Guid userId);
        Task<string> RefreshAllTokens();
        Task<FlowAuthentication> Authenticate(Guid userId);
        Task<string> Refresh(string token);
    }
}