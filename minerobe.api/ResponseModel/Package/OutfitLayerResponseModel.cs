using minerobe.api.Entity.Package;

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
        public string ColorName { get; set; }
        public string OutfitType { get; set; }
        public bool IsLoaded { get; set; }
    }
    public static class OutfitLayerResponseModelExtensions
    {
        public static OutfitLayerResponseModel ToResponseModel(this OutfitLayer entity, OutfitPackage packageContext, bool toSnapshot = true, bool isLoaded = true)
        {
            return ToResponseModel(entity, packageContext.Id, toSnapshot, isLoaded);
        }
        public static OutfitLayerResponseModel ToResponseModel(this OutfitLayer entity, Guid packageId, bool toSnapshot = true, bool isLoaded = true)
        {
            LayerType type = LayerType.Local;
            if (entity.SourcePackageId != packageId)
                type = LayerType.Remote;

            return new OutfitLayerResponseModel
            {
                Id = entity.Id,
                Name = entity.Name,
                SourcePackageId = entity.SourcePackageId,
                Steve = isLoaded ? entity.Steve.ToResponseModel(toSnapshot) : null,
                Alex = isLoaded ? entity.Alex.ToResponseModel(toSnapshot) : null,
                Type = type.ToString().ToLower(),
                IsSnapshot = toSnapshot,
                ColorName = entity.ColorName,
                OutfitType = entity.OutfitType.ToString().ToLower(),
                IsLoaded = isLoaded,
            };
        }
    }
}
