using minerobe.api.Modules.Core.Package.ResponseModel;
using minerobe.api.Modules.Core.Settings.Entity;

namespace minerobe.api.Modules.Core.Settings.ResponseModel
{
    public class UserSettingsResponseModel
    {
        public Guid Id { get; set; }
        public Guid OwnerId { get; set; }
        public OutfitPackageConfigResponseModel CurrentTexture { get; set; }
        public OutfitPackageResponseModel BaseTexture { get; set; }
        public List<string> Integrations { get; set; }
    }
    public static class UserSettingsResponseModelExtensions
    {
        public static UserSettingsResponseModel ToResponseModel(this UserSettings entity)
        {
            return new UserSettingsResponseModel
            {
                Id = entity.Id,
                OwnerId = entity.OwnerId,
                BaseTexture = entity.BaseTexture?.ToResponseModel(),
                CurrentTexture = entity.CurrentTexture.ToResponseModel(),
                Integrations = entity.Integrations?.Select(x => x.Type).ToList(),

            };
        }
    }
}
