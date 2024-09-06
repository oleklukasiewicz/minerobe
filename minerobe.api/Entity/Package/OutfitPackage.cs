using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using minerobe.api.Entity.User;
using minerobe.api.Extensions;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace minerobe.api.Entity.Package
{
    public enum PackageType
    {
       Set,
       Outfit
    }
    public enum ModelType
    { 
        Steve,
        Alex
    }
    public enum OutfitType
    {
        Top,
        Hoodie,
        Hat,
        Bottom,
        Shoes,
        Accessory,
        Suit,
        Default,
        Set
    }

    public class OutfitPackage
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public ModelType Model { get; set; }
        public PackageType Type { get; set; }
        public Guid PublisherId { get; set; }
        public string Description { get; set; }
        public Guid SocialDataId { get; set; }
        public SocialData Social { get; set; }
        public OutfitType OutfitType { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public List<OutfitLayer> Layers { get; set; }
        public MinerobeUser Publisher { get; set; }
        public Guid? PrimaryLayerId { get; set; }
    }
    public class OutfitPackageConfig : IEntityTypeConfiguration<OutfitPackage>
    {
        public void Configure(EntityTypeBuilder<OutfitPackage> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x=>x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.Property(x => x.Name).IsRequired();
            builder.Property(x => x.Model).IsRequired();
            builder.Property(x => x.Type).IsRequired();
            builder.Property(x => x.Description).IsRequired();
            builder.Property(x => x.OutfitType).IsRequired();
            builder.Property(x => x.CreatedAt).HasDefaultValueSql("getdate()");
            builder.Property(x => x.ModifiedAt);
            builder.Ignore(x => x.Social);
            builder.Ignore(x => x.Publisher);
            builder.Ignore(x => x.Layers);

            builder.ToTable("Packages");
        }
    }
}
