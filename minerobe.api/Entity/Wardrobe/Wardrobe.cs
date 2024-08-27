using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using minerobe.api.Entity.Collection;
using minerobe.api.Entity.Package;
using System.Text.Json.Serialization;


namespace minerobe.api.Entity.Wardrobe
{
    public class Wardrobe
    {
        public Guid Id { get; set; }
        public List<OutfitPackage> Outfits { get; set; }
        public List<OutfitPackageCollection> Collections { get; set; }
    }
    public class WadrobeConfig : IEntityTypeConfiguration<Wardrobe>
    {
        public void Configure(EntityTypeBuilder<Wardrobe> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.Ignore(x => x.Outfits);
            builder.Ignore(x => x.Collections);

            builder.ToTable("Wardrobes");
        }
    }
}
