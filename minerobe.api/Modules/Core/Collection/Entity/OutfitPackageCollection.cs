using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using minerobe.api.Extensions;
using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.Social.Entity;
using minerobe.api.Modules.Core.User.Entity;

namespace minerobe.api.Modules.Core.Collection.Entity
{
    public class OutfitPackageCollection
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public List<OutfitPackage> Items { get; set; }
        public Guid PublisherId { get; set; }
        public MinerobeUser Publisher { get; set; }
        public Guid SocialDataId { get; set; }
        public SocialData Social { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ModifiedAt { get; set; }
        public dynamic DisplayData { get; set; }
    }
    public class OutfitPackageCollectionEntityConfig : IEntityTypeConfiguration<OutfitPackageCollection>
    {
        public void Configure(EntityTypeBuilder<OutfitPackageCollection> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.Property(x => x.Name).IsRequired();
            builder.Property(x => x.PublisherId).IsRequired();
            builder.Property(x => x.CreatedAt).HasDefaultValueSql("getdate()");
            builder.Property(x => x.ModifiedAt).IsRequired();
            builder.Property(x => x.DisplayData).StoreAsJSON();
            builder.Ignore(x => x.Social);
            builder.Ignore(x => x.Items);
            builder.Ignore(x => x.Publisher);
            builder.ToTable("OutfitPackageCollection");
        }
    }
}
