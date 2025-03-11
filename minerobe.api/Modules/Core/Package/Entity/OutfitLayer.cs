using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using minerobe.api.Extensions;

namespace minerobe.api.Modules.Core.Package.Entity
{
    public enum LayerType
    {
        Local,
        Remote
    }
    public class OutfitLayer
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Guid? SourcePackageId { get; set; }
        public FileData Steve { get; set; }
        public FileData Alex { get; set; }
        public LayerType Type { get; set; }
        public string ColorName { get; set; }
        public OutfitType OutfitType { get; set; }

    }
    public class OutfitLayerEntityConfig : IEntityTypeConfiguration<OutfitLayer>
    {
        public void Configure(EntityTypeBuilder<OutfitLayer> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.Property(x => x.Name).IsRequired();
            builder.Property(x => x.SourcePackageId).IsRequired();
            builder.Ignore(x => x.Type);
            builder.Property(x => x.Steve).StoreAsJSON();
            builder.Property(x => x.Alex).StoreAsJSON();
            builder.ToTable("Layers");
        }
    }
}
