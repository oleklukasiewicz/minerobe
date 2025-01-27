using minerobe.api.Entity;
using minerobe.api.Entity.Package;
using minerobe.api.Helpers.Model;
using minerobe.api.ResponseModel.User;

namespace minerobe.api.ResponseModel.Package
{

    public class OutfitPackageListItemResponseModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Model { get; set; }
        public string Type { get; set; }
        public SocialData Social { get; set; }
        public string OutfitType { get; set; }
        public List<OutfitLayerResponseModel> Layers { get; set; }
        public int TotalLayersCount { get; set; }
        public MinerobePackageUserResponseModel Publisher { get; set; }
        public bool IsInWardrobe { get; set; }
        public OutfitPackagePresentationConfigModel PresentationConfig { get; set; }
    }
    public static class OutfitPackageListItemResponseModelExtensions
    {
        public static OutfitPackageListItemResponseModel ToListItemResponseModel(this OutfitPackage entity, int layersCount = 2, int loadedCount = 1, bool isInWardrobe = false)
        {
            var layers = new List<OutfitLayerResponseModel>();
            if (layersCount > entity.Layers.Count)
                layersCount = entity.Layers.Count;
            var mergedLayers = entity.Layers.Where(x => x.IsMerged).FirstOrDefault();
            var presentationMode = new OutfitPackagePresentationConfigModel();
            if (entity.Type == PackageType.Set && mergedLayers != null)
            {
                presentationMode.IsMerged = true;
                presentationMode.IsSnapshot = false;
                layers.Add(mergedLayers.ToResponseModel(entity, false));
            }
            else
            {
                presentationMode.IsMerged = false;
                presentationMode.IsSnapshot = true;
                if (entity.Layers?.Count > 0)
                {
                    for (int i = 0; i < layersCount; i++)
                    {
                        layers.Add(entity.Layers[i].ToResponseModel(entity, false, i < loadedCount));
                    }
                }
            }

            return new OutfitPackageListItemResponseModel
            {
                Id = entity.Id,
                Name = entity.Name,
                Model = entity.Model.ToString().ToLower(),
                Type = entity.Type.ToString().ToLower(),
                Social = entity.Social,
                OutfitType = entity.OutfitType.ToString().ToLower(),
                IsInWardrobe = isInWardrobe,
                Layers = layers,
                Publisher = entity.Publisher.ToPackageResponseModel(),
                TotalLayersCount = entity.Layers != null ? entity.Layers.Count : 0,
                PresentationConfig = presentationMode
            };
        }
        public static List<OutfitPackageListItemResponseModel> ToListItemResponseModel(this List<OutfitPackage> entity, int layersCount = 2, int loadedCount = 1)
        {
            var mapped = entity.Select(x => x.ToListItemResponseModel(layersCount)).ToList();
            return mapped;
        }
        public static PagedResponse<OutfitPackageListItemResponseModel> ToResponseModel(this PagedResponse<OutfitPackage> entity)
        {
            var items = entity.Items.Select(x => x.ToListItemResponseModel()).ToList();
            return new PagedResponse<OutfitPackageListItemResponseModel>
            {
                Items = items,
                Page = entity.Page,
                PageSize = entity.PageSize,
                Total = entity.Total
            };
        }
    }
}
