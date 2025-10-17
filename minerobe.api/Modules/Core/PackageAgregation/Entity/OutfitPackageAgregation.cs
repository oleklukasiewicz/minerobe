using minerobe.api.Modules.Core.Package.Entity;

namespace minerobe.api.Modules.Core.PackageAgregation.Entity
{
    public class OutfitPackageAgregation
    {
        //package
        public Guid Id { get; set; }
        public string Name { get; set; }
        public PackageType Type { get; set; }
        public string PublisherName { get; set; }
        public Guid PublisherId { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        //layer
        public Guid? LayerId { get; set; }
        public Guid? LayerSourcePackageId { get; set; }
        public string ColorName { get; set; }
        public string PackageColorName { get; set; }
        public OutfitType OutfitType { get; set; }
        //social
        public int Downloads { get; set; }
        public bool IsFeatured { get; set; }
        public int Likes { get; set; }
        public bool IsShared { get; set; }

        //wardrobe
        public Guid? WardrobeId { get; set; }

    }
}
