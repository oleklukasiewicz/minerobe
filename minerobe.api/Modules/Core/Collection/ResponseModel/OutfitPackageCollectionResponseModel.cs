using minerobe.api.Entity;
using minerobe.api.Entity.Collection;
using minerobe.api.ResponseModel.Package;
using minerobe.api.ResponseModel.User;

namespace minerobe.api.ResponseModel.Collection
{
    public class OutfitPackageCollectionResponseModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public List<OutfitPackageListItemResponseModel> Items { get; set; }
        public MinerobePackageUserResponseModel Publisher { get; set; }
        public Guid PublisherId { get; set; }
        public dynamic DisplayData { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public SocialData Social { get; set; }
        public bool IsInWardrobe { get; set; }
    }
    public static class OutfitPackageCollectionResponseModelExtensions
    {
        public static OutfitPackageCollectionResponseModel ToResponseModel(this OutfitPackageCollection entity)
        {
            var items = entity.Items.Select(x => x.ToListItemResponseModel()).ToList();
            return new OutfitPackageCollectionResponseModel
            {
                Id = entity.Id,
                Name = entity.Name,
                Description = entity.Description,
                Items = items,
                PublisherId = entity.PublisherId,
                Publisher = entity.Publisher.ToPackageResponseModel(),
                DisplayData = entity.DisplayData,
                CreatedAt = entity.CreatedAt,
                ModifiedAt = entity.ModifiedAt,
                Social = entity.Social,
            };
        }
        public static List<OutfitPackageCollectionResponseModel> ToResponseModel(this List<OutfitPackageCollection> entity)
        {
            var mapped = entity.Select(x => x.ToResponseModel()).ToList();
            return mapped;
        }
    }
}
