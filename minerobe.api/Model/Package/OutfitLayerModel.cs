using minerobe.api.Entity;
using minerobe.api.Entity.Package;

namespace minerobe.api.Model.Package
{
    public class OutfitLayerModel
    {
        public string Name { get; set; }
        public Guid? Id { get; set; }
        public Guid? SourcePackageId { get; set; }
        public FileDataModel Steve { get; set; }
        public FileDataModel Alex { get; set; }
    }
    public static class OutfitLayerExtensions
    {
        public static OutfitLayer ToEntity(this OutfitLayerModel model)
        {
            var layer = new OutfitLayer
            {
                Name = model.Name,
                SourcePackageId = model.SourcePackageId,
                Steve = model.Steve.ToEntity(),
                Alex = model.Alex.ToEntity()
            };
            if (model.Id.HasValue)
                layer.Id = model.Id.Value;
            return layer;
        }
    }

}
