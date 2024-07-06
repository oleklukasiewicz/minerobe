using minerobe.api.Entity.Settings;
using minerobe.api.ResponseModel.Integration.JavaXbox;
using minerobe.api.ResponseModel.Package;

namespace minerobe.api.ResponseModel.User
{
    public class UserSettingsSimpleResponseModel
    {
        public Guid Id { get; set; }
        public Guid OwnerId { get; set; }
        public Guid? CurrentTexturePackageId { get; set; }
        public OutfitPackageListItemResponseModel? BaseTexture { get; set; }
        public JavaXboxProfileSimpleResponseModel? LinkedAccount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
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
                LinkedAccount = entity.LinkedAccount?.ToSimpleResponseModel(),
            };
        }
    }
}
