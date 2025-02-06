using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.Settings.Entity;
using minerobe.api.Modules.Core.User.Entity;
using minerobe.api.Modules.Integration.Minecraft.Helpers;
using static minerobe.api.Modules.Integration.Minecraft.Service.MinecraftService;

namespace minerobe.api.Modules.Integration.Minecraft.Interface
{
    public interface IMinecraftService
    {
        Task<MinecraftAccount> GetProfile(MinerobeUser user, bool keepFresh = true);
        Task<MinecraftAccount> LinkAccount(MinerobeUser user);
        Task<bool> UnLinkAccount(MinerobeUser user);
        Task<bool> SetUserSkin(Guid userId, OutfitPackageConfig config);
        Task<bool> SetUserCape(Guid userId, Guid capeId);
        Task<bool> HideUserCape(Guid userId);
        Task<string> RefreshAllTokens();
        Task<FlowAuthentication> Authenticate(Guid userId);
        Task<string> Refresh(string token);
    }
}