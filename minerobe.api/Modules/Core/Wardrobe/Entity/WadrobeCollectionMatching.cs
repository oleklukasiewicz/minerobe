using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace minerobe.api.Modules.Core.Wardrobe.Entity
{
    public class WadrobeCollectionMatching
    {
        public Guid Id { get; set; }
        public Guid WardrobeId { get; set; }
        public Guid OutfitPackageCollectionId { get; set; }
    }
    public class WadrobeCollectionMatchingEntityConfig : IEntityTypeConfiguration<WadrobeCollectionMatching>
    {
        public void Configure(EntityTypeBuilder<WadrobeCollectionMatching> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.Property(x => x.WardrobeId).IsRequired();
            builder.Property(x => x.OutfitPackageCollectionId).IsRequired();

            builder.ToTable("WardrobeCollectionMatching");
        }
    }
}
