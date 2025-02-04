using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.Settings.Entity;
using minerobe.api.Modules.Core.Settings.Model;

namespace minerobe.api.Modules.Core.Settings.Interface
{
    public interface IUserSettingsService
    {
        Task<UserSettings> GetSettings(Guid userId);
        Task<UserSettings> UpdateBaseTexture(Guid userId, OutfitPackage basetexture);
        Task<UserSettings> UpdateCurrentTexture(Guid userId, OutfitPackageConfigModel currentTexture);
        Task<UserSettings> AddIntegration(Guid userId, IntegrationMatching integration);
        Task<UserSettings> RemoveIntegration(Guid userId, string integrationId);
    }
}