using minerobe.api.Modules.Core.Settings.Entity;

namespace minerobe.api.Modules.Core.Settings.ResponseModel
{
    public class OutfitPackageConfigResponseModel
    {
        public Guid PackageId { get; set; }
        public string Type { get; set; }
        public string Model { get; set; }
        public bool IsFlatten { get; set; }
        public Guid? CapeId { get; set; }
    }
    public static class CurrentTextureResponseSimpleModelExtensions
    {
        public static OutfitPackageConfigResponseModel ToResponseModel(this OutfitPackageConfig entity)
        {
            return new OutfitPackageConfigResponseModel
            {
                PackageId = entity.PackageId,
                Type = entity.Type.ToString().ToLower(),
                Model = entity.Model.ToString().ToLower(),
                IsFlatten = entity.IsFlatten,
                CapeId = entity.CapeId
            };
        }
    }
}
