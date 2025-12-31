using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.Social.Entity;
using minerobe.api.Modules.Core.User.ResponseModel;

namespace minerobe.api.Modules.Core.Package.ResponseModel
{

    public class OutfitPackageListItemResponseModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Model { get; set; }
        public string Type { get; set; }
        public string ColorName { get; set; }
        public SocialData Social { get; set; }
        public string OutfitType { get; set; }
        public List<OutfitLayerResponseModel> Layers { get; set; }
        public int TotalLayersCount { get; set; }
        public MinerobePackageUserResponseModel Publisher { get; set; }
        public bool IsInWardrobe { get; set; }
        public bool IsInCollection { get; set; }
    }
    public static class OutfitPackageListItemResponseModelExtensions
    {
        public static OutfitPackageListItemResponseModel ToListItemResponseModel(this OutfitPackage entity, int layersCount = 2, int loadedCount = 1, bool isInWardrobe = false, bool isInCollection = false)
        {
            var layers = new List<OutfitLayerResponseModel>();
            if (layersCount > entity.Layers.Count)
                layersCount = entity.Layers.Count;
            if (entity.Layers?.Count > 0)
            {
                if (layersCount < 0)
                    layersCount = entity.Layers.Count;
                for (int i = 0; i < layersCount; i++)
                {
                    layers.Add(entity.Layers[i].ToResponseModel(entity, loadedCount < 0 ? true : i < loadedCount));
                }
            }


            return new OutfitPackageListItemResponseModel
            {
                Id = entity.Id,
                Name = entity.Name,
                ColorName = entity.ColorName,
                Model = entity.Model.ToString().ToLower(),
                Type = entity.Type.ToString().ToLower(),
                Social = entity.Social,
                OutfitType = entity.OutfitType.ToString().ToLower(),
                IsInWardrobe = isInWardrobe,
                IsInCollection = isInCollection,
                Layers = layers,
                Publisher = entity.Publisher.ToPackageResponseModel(),
                TotalLayersCount = entity.Layers != null ? entity.Layers.Count : 0
            };
        }
    }
}
