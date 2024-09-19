using minerobe.api.Entity.Collection;

namespace minerobe.api.Model
{
    public class OutfitPackageCollectionModel
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public Guid PublisherId { get; set; }
        public dynamic DisplayData { get; set; }
    }
    public static class OutfitPackageCollectionModelExtensions
    {
        public static OutfitPackageCollection ToEntity(this OutfitPackageCollectionModel model)
        {
            return new OutfitPackageCollection
            {
                Name = model.Name,
                Description = model.Description,
                PublisherId = model.PublisherId,
                DisplayData = model.DisplayData
            };
        }
    }
}
