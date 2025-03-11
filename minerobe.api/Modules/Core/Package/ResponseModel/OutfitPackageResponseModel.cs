using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.Social.Entity;
using minerobe.api.Modules.Core.User.ResponseModel;

namespace minerobe.api.Modules.Core.Package.ResponseModel
{
    public class OutfitPackageResponseModel
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
        public List<OutfitLayerResponseModel> Layers { get; set; }
        public int TotalLayersCount { get; set; }
        public Guid PublisherId { get; set; }
        public MinerobePackageUserResponseModel Publisher { get; set; }
        public bool IsInWardrobe { get; set; }
    }
    public static class OutfitPackageResponseModelExtensions
    {
        public static OutfitPackageResponseModel ToResponseModel(this OutfitPackage entity)
        {
            return entity.ToResponseModel(false);
        }
        public static OutfitPackageResponseModel ToResponseModel(this OutfitPackage entity, bool isInWardrobe, bool loadLayers = true, bool allowmergedLayers = false)
        {
            var layers = loadLayers ? entity.Layers.Select(x => x.ToResponseModel(entity, true)).ToList() : new List<OutfitLayerResponseModel>();
            return new OutfitPackageResponseModel
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
                Layers = layers,
                PublisherId = entity.PublisherId,
                Publisher = entity.Publisher.ToPackageResponseModel(),
                TotalLayersCount = entity.Layers != null ? entity.Layers.Count : 0,
                IsInWardrobe = isInWardrobe
            };
        }
        public static List<OutfitPackageResponseModel> ToResponseModel(this List<OutfitPackage> entity)
        {
            var mapped = entity.Select(x => x.ToResponseModel()).ToList();
            return mapped;
        }
        public static List<OutfitPackageListItemResponseModel> ToSingleLayerResponseModel(this OutfitPackage entity, bool isInWardrobe = false)
        {
            var layers = new List<OutfitPackageListItemResponseModel>();
            foreach (var layer in entity.Layers)
            {
                var outfit = entity.ToListItemResponseModel(1, 1, isInWardrobe);
                outfit.Layers = new List<OutfitLayerResponseModel> { layer.ToResponseModel(entity) };
                layers.Add(outfit);
            }
            return layers;
        }

        public static List<OutfitPackageListItemResponseModel> ToSingleLayerResponseModel(this List<OutfitPackage> entity, bool isInWadrobe = false)
        {
            var packs = new List<OutfitPackageListItemResponseModel>();
            foreach (var pack in entity)
            {
                var splited = pack.ToSingleLayerResponseModel(isInWadrobe);
                packs.AddRange(splited);
            }
            return packs;
        }
    }
}
