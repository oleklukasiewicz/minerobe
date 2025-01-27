using minerobe.api.Modules.Core.Package.ResponseModel;
using minerobe.api.Modules.Core.Settings.Entity;

namespace minerobe.api.Modules.Core.Settings.ResponseModel
{
    public class UserSettingsSimpleResponseModel
    {
        public Guid Id { get; set; }
        public Guid OwnerId { get; set; }
        public Guid? CurrentTexturePackageId { get; set; }
        public TextureConfigResponseModel CurrentTextureConfig { get; set; }
        public Guid? CurrentCapeId { get; set; }
        public OutfitPackageListItemResponseModel BaseTexture { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public List<string> Integrations { get; set; }
    }
    public static class UserSettingsSimpleResponseModelExtensions
    {
        public static UserSettingsSimpleResponseModel ToSimpleResponseModel(this UserSettings entity)
        {
            return new UserSettingsSimpleResponseModel
            {
                Id = entity.Id,
                OwnerId = entity.OwnerId,
                BaseTexture = entity.BaseTexture?.ToListItemResponseModel(),
                CurrentTexturePackageId = entity.CurrentTexturePackageId,
                CurrentTextureConfig = entity.CurrentTexture?.ToConfigResponse(),
                CurrentCapeId = entity.CurrentTexture?.CapeId,
                Integrations = entity.Integrations?.Select(x => x.Type).ToList(),
                CreatedAt = entity.CreatedAt,
                ModifiedAt = entity.ModifiedAt
            };
        }
    }
}
