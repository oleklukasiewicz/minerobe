using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.Settings.Entity;

namespace minerobe.api.Modules.Core.Settings.Interface
{
    public interface IUserSettingsService
    {
        Task<UserSettings> GetSettings(Guid userId);
        Task<UserSettings> UpdateBaseTexture(Guid userId, OutfitPackage basetexture);
        Task<UserSettings> UpdateCurrentTexture(Guid userId, Guid packageId, TextureRenderConfig currentTexture);
        Task<UserSettings> UpdateTheme(Guid userId, string theme);
        Task<UserSettings> AddIntegration(Guid userId, IntegrationMatching integration);
        Task<UserSettings> RemoveIntegration(Guid userId, string integrationId);
    }
}