using minerobe.api.Modules.Core.Package.Entity;

namespace minerobe.api.Modules.Core.Settings.Entity
{
    public class OutfitPackageConfig
    {
        public Guid PackageId { get; set; }
        public PackageType Type { get; set; }
        public ModelType Model { get; set; }
        public bool IsFlatten { get; set; }
        public Guid? CapeId { get; set; }
    }
}
