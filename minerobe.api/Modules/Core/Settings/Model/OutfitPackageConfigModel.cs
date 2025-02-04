using minerobe.api.Helpers;
using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.Settings.Entity;

namespace minerobe.api.Modules.Core.Settings.Model
{
    public class OutfitPackageConfigModel
    {
        public Guid PackageId { get; set; }
        public string Type { get; set; }
        public string Model { get; set; }
        public bool IsFlatten { get; set; }
        public Guid? CapeId { get; set; }
    }
    public static class OutfitPackageConfigModelExtensions
    {
        public static OutfitPackageConfig ToEntity(this OutfitPackageConfigModel model)
        {
            return new OutfitPackageConfig
            {
                PackageId = model.PackageId,
                Type = Enum.Parse<PackageType>(model.Type.ToFirstCapitalLetter()),
                Model = Enum.Parse<ModelType>(model.Model.ToFirstCapitalLetter()),
                IsFlatten = model.IsFlatten,
                CapeId = model.CapeId
            };
        }
    }
}
