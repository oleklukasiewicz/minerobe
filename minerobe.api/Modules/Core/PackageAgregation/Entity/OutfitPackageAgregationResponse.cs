using minerobe.api.Modules.Core.Package.Entity;

namespace minerobe.api.Modules.Core.PackageAgregation.Entity
{
    public class OutfitPackageAgregationResponse
    {
        public OutfitPackage Package { get; set; }
        public bool IsInWardrobe { get; set; }
        public bool IsInCollection { get; set; }
    }
}
