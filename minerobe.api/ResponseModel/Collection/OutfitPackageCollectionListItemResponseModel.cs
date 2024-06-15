using minerobe.api.Entity;
using minerobe.api.Entity.Collection;
using minerobe.api.ResponseModel.Package;
using minerobe.api.ResponseModel.User;

namespace minerobe.api.ResponseModel.Collection
{
    public class OutfitPackageCollectionListItemResponseModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int ItemsCount { get; set; }
        public Guid PublisherId { get; set; }
        public MinerobePackageUserResponseModel Publisher { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public SocialData Social { get; set; }
        public bool IsInWardrobe { get; set; }
    }
    public static class OutfitPackageCollectionListItemResponseModelExtensions
    {
        public static OutfitPackageCollectionListItemResponseModel ToListItemResponseModel(this OutfitPackageCollection entity, bool isInWardrobe = false)
        {
            return new OutfitPackageCollectionListItemResponseModel
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
                IsInWardrobe = isInWardrobe
            };
        }
        public static List<OutfitPackageCollectionListItemResponseModel> ToListItemResponseModel(this List<OutfitPackageCollection> entity, bool isInWardrobe = false)
        {
            var mapped = entity.Select(x => x.ToListItemResponseModel(isInWardrobe)).ToList();
            return mapped;
        }
    }
}
