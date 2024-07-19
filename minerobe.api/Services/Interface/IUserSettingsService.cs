using minerobe.api.Entity.Package;
using minerobe.api.Entity.Settings;

namespace minerobe.api.Services.Interface
{
    public interface IUserSettingsService
    { 
        Task<UserSettings> GetSettings(Guid userId);
        Task<UserSettings> UpdateBaseTexture(Guid userId, OutfitPackage basetexture);
        Task<UserSettings> UpdateCurrentTexture(Guid userId, Guid packageId, TextureRenderConfig currentTexture);
        Task<UserSettings> UpdateTheme(Guid userId, string theme);
        Task<UserSettings> AddIntegration(Guid userId, string integrationId);
        Task<UserSettings> RemoveIntegration(Guid userId, string integrationId);
    }
}