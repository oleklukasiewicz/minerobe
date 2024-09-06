using minerobe.api.Entity.Package;
using minerobe.api.Entity;
using minerobe.api.Model;
using minerobe.api.ResponseModel.User;
using minerobe.api.Helpers;

namespace minerobe.api.ResponseModel.Package
{
    public class OutfitPackageSimpleResponseModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Model { get; set; }
        public string Type { get; set; }
        public string Description { get; set; }
        public SocialData Social { get; set; }
        public string OutfitType { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public MinerobePackageUserResponseModel Publisher { get; set; }
        public bool IsInWardrobe { get; set; }
        public Guid? PrimaryLayerId { get; set; }
    }
    public static class OutfitPackageSimpleResponseModelExtensions
    {
        public static OutfitPackageSimpleResponseModel ToSimpleResponseModel(this OutfitPackage entity, bool isInWardrobe)
        {
            return new OutfitPackageSimpleResponseModel
            {
                Id = entity.Id,
                Name = entity.Name,
                Model = entity.Model.ToString().ToLower(),
                Type = entity.Type.ToString().ToLower(),
                Description = entity.Description,
                Social = entity.Social,
                OutfitType = entity.OutfitType.ToString().ToLower(),
                CreatedAt = entity.CreatedAt,
                ModifiedAt = entity.ModifiedAt,
                Publisher = entity.Publisher.ToPackageResponseModel(),
                IsInWardrobe = isInWardrobe,
                PrimaryLayerId = entity.PrimaryLayerId
            };
        }
    }
}
