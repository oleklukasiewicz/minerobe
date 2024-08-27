using minerobe.api.Entity.Collection;
using minerobe.api.Entity.Package;

namespace minerobe.api.Helpers.Wardrobe
{
    public class Wardrobe
    {
        public Guid Id { get; set; }
        public List<OutfitPackage> Outfits { get; set; }
        public List<OutfitPackageCollection> Collections { get; set; }
    }
}
