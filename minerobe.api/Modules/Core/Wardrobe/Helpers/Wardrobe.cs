using minerobe.api.Modules.Core.Collection.Entity;
using minerobe.api.Modules.Core.Package.Entity;

namespace minerobe.api.Modules.Core.Wardrobe.Helpers
{
    public class Wardrobe
    {
        public Guid Id { get; set; }
        public List<OutfitPackage> Outfits { get; set; }
        public List<OutfitPackageCollection> Collections { get; set; }
    }
}
