using minerobe.api.Entity;
using minerobe.api.Entity.Package;
using minerobe.api.Helpers;

namespace minerobe.api.Model.Package
{
    public class OutfitPackageModel
    {
        public string Name { get; set; }
        public string Model { get; set; }
        public string Type { get; set; }
        public List<OutfitLayerModel> Layers { get; set; }
        public Guid PublisherId { get; set; }
        public string Description { get; set; }
        public string OutfitType { get; set; }

    }
    public static class OutfitPackageModelExtensions
    {
        public static OutfitPackage ToEntity(this OutfitPackageModel model)
        {
            var layers = model.Layers.Select(x => x.ToEntity()).ToList();

            return new OutfitPackage
            {
                Name = model.Name,
                Model = Enum.Parse<ModelType>(model.Model.ToFirstCapitalLetter()),
                Type = Enum.Parse<PackageType>(model.Type.ToFirstCapitalLetter()),
                Layers = layers,
                PublisherId = model.PublisherId,
                Description = model.Description,
                OutfitType = Enum.Parse<OutfitType>(model.OutfitType.ToFirstCapitalLetter())
            };
        }
    }

}
