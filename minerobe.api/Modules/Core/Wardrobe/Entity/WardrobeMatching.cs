using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace minerobe.api.Modules.Core.Wardrobe.Entity
{
    public class WardrobeMatching
    {
        public Guid Id { get; set; }
        public Guid WardrobeId { get; set; }
        public Guid OutfitPackageId { get; set; }
    }
    public class WadrobeMatchingConfig : IEntityTypeConfiguration<WardrobeMatching>
    {
        public void Configure(EntityTypeBuilder<WardrobeMatching> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.Property(x => x.WardrobeId).IsRequired();
            builder.Property(x => x.OutfitPackageId).IsRequired();

            builder.ToTable("WardrobeMatching");
        }
    }
}
