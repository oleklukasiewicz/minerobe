using minerobe.api.Entity.Package;
using minerobe.api.Entity;

namespace minerobe.api.ResponseModel.Package
{
    public class OutfitLayerResponseModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Guid? SourcePackageId { get; set; }
        public FileDataResponseModel? Steve { get; set; }
        public FileDataResponseModel? Alex { get; set; }
        public string Type { get; set; }
        public bool IsSnapshot { get; set; }
    }
    public static class OutfitLayerResponseModelExtensions
    {
        public static OutfitLayerResponseModel ToResponseModel(this OutfitLayer entity, OutfitPackage packageContext, bool toSnapshot = true)
        {
            LayerType type = LayerType.Local;
            if (entity.SourcePackageId != packageContext.Id)
                type = LayerType.Remote;

            return new OutfitLayerResponseModel
            {
                Id = entity.Id,
                Name = entity.Name,
                SourcePackageId = entity.SourcePackageId,
                Steve = entity.Steve.ToResponseModel(toSnapshot),
                Alex = entity.Alex.ToResponseModel(toSnapshot),
                Type = type.ToString().ToLower(),
                IsSnapshot = toSnapshot
            };
        }
        public static OutfitLayerResponseModel ToResponseModel(this OutfitLayer entity, Guid packageId, bool toSnapshot = true)
        {
            LayerType type = LayerType.Local;
            if (entity.SourcePackageId != packageId)
                type = LayerType.Remote;

            return new OutfitLayerResponseModel
            {
                Id = entity.Id,
                Name = entity.Name,
                SourcePackageId = entity.SourcePackageId,
                Steve = entity.Steve.ToResponseModel(toSnapshot),
                Alex = entity.Alex.ToResponseModel(toSnapshot),
                Type = type.ToString().ToLower(),
                IsSnapshot = toSnapshot
            };
        }
    }
}
