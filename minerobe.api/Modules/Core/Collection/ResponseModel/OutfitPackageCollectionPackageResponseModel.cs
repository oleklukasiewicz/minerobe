using minerobe.api.Modules.Core.Collection.Entity;
using minerobe.api.Modules.Core.Collection.ResponseModel;
using minerobe.api.Modules.Core.Social.Entity;
using minerobe.api.Modules.Core.User.ResponseModel;

namespace minerobe.api.Modules.Core.Collection.ResponseModel
{
    public class OutfitPackageCollectionPackageResponseModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int ItemsCount { get; set; }
        public bool IsInCollection { get; set; }
        public Guid PublisherId { get; set; }
        public MinerobePackageUserResponseModel Publisher { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public SocialData Social { get; set; }
        public bool IsInWardrobe { get; set; }
    }
    public static class OutfitPackageCollectionPackageResponseModelExtensions
    {
        public static OutfitPackageCollectionPackageResponseModel ToPackageResponseModel(this OutfitPackageCollection entity, Guid packageId, bool isInWardrobe = false)
        {
            var isInCollection = entity.Items.Any(x => x.Id == packageId);

            return new OutfitPackageCollectionPackageResponseModel
            {
                Id = entity.Id,
                Name = entity.Name,
                Description = entity.Description,
                PublisherId = entity.PublisherId,
                Publisher = entity.Publisher.ToPackageResponseModel(),
                ItemsCount = entity.Items.Count,
                CreatedAt = entity.CreatedAt,
                ModifiedAt = entity.ModifiedAt,
                Social = entity.Social,
                IsInWardrobe = isInWardrobe,
                IsInCollection = isInCollection
            };
        }
        public static List<OutfitPackageCollectionPackageResponseModel> ToPackageResponseModel(this List<OutfitPackageCollection> entity, Guid packageId, bool isInWardrobe = false)
        {
            var mapped = entity.Select(x => x.ToPackageResponseModel(packageId, isInWardrobe)).ToList();
            return mapped;
        }
    }
}
