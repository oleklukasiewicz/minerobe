using minerobe.api.Entity.Package;
using minerobe.api.Entity.Settings;
using minerobe.api.ResponseModel.Package;

namespace minerobe.api.ResponseModel.User
{
    public class UserSettingsResponseModel
    {
        public Guid Id { get; set; }
        public Guid OwnerId { get; set; }
        public string Theme { get; set; }
        public Guid? CurrentTexturePackageId { get; set; }
        public CurrentTextureResponseModel CurrentTexture { get; set; }
        public OutfitPackageListItemResponseModel? BaseTexture { get; set; }
        public UserLinkedAccount? LinkedAccount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
    }
    public static class UserSettingsResponseModelExtensions
    {
        public static UserSettingsResponseModel ToResponseModel(this UserSettings entity)
        {
            return new UserSettingsResponseModel
            {
                Id = entity.Id,
                OwnerId = entity.OwnerId,
                Theme = entity.Theme,
                BaseTexture = entity.BaseTexture.ToListItemResponseModel(),
                CurrentTexturePackageId = entity.CurrentTexturePackageId,
                CurrentTexture= entity.CurrentTexture.ToResponseModel()
                
            };
        }
    }
}
