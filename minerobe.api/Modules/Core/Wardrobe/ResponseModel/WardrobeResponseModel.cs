using minerobe.api.Modules.Core.Collection.ResponseModel;
using minerobe.api.Modules.Core.Package.ResponseModel;
using minerobe.api.Modules.Core.Wardrobe.ResponseModel;

namespace minerobe.api.Modules.Core.Wardrobe.ResponseModel
{
    public class WardrobeResponseModel
    {
        public Guid Id { get; set; }
        public List<OutfitPackageListItemResponseModel> Outfits { get; set; }
        public List<OutfitPackageCollectionResponseModel> Collections { get; set; }
    }
    public static class WardrobeResponseModelExtensions
    {
        public static WardrobeResponseModel ToResponseModel(this Helpers.Wardrobe.Wardrobe entity)
        {
            var outfits = entity.Outfits?.Select(x => x?.ToListItemResponseModel(2, 1, true)).ToList();
            var collections = entity.Collections?.Select(x => x.ToResponseModel()).ToList();

            return new WardrobeResponseModel
            {
                Id = entity.Id,
                Outfits = outfits,
                Collections = collections
            };
        }
    }
}
