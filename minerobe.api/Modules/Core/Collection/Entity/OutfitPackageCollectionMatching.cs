using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace minerobe.api.Modules.Core.Collection.Entity
{
    public class OutfitPackageCollectionMatching
    {
        public Guid Id { get; set; }
        public Guid CollectionId { get; set; }
        public Guid PackageId { get; set; }
    }
    public class OutfitPackageCollectionMatchingEntityConfig : IEntityTypeConfiguration<OutfitPackageCollectionMatching>
    {
        public void Configure(EntityTypeBuilder<OutfitPackageCollectionMatching> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.Property(x => x.CollectionId).IsRequired();
            builder.Property(x => x.PackageId).IsRequired();
            builder.ToTable("OutfitPackageCollectionMatching");
        }
    }
}
