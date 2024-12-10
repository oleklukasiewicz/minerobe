using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace minerobe.api.Entity.Summary
{
    public class OutfitPackageAgregation
    {
        public Guid Id { get; set; }
        public Guid? VariantId { get; set; }
        public string Name { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Publisher { get; set; }
        public int Type { get; set; }
        public int OutfitType { get; set; }
        public int LayersCount { get; set; }
        public Guid SocialDataId { get; set; }
        public int Downloads { get; set; }
        public bool IsFeatured { get; set; }
        public int Likes { get; set; }
        public bool IsShared { get; set; }
        public string Colors { get; set; }
    }
    public class OutfitPackageAgregationConfiguration : IEntityTypeConfiguration<OutfitPackageAgregation>
    {
        public void Configure(EntityTypeBuilder<OutfitPackageAgregation> builder)
        {
            builder.HasNoKey();
            builder.ToView("vPackagesView");
        }
    }
}
