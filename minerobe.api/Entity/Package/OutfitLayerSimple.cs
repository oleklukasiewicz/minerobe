using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace minerobe.api.Entity.Package
{
    public class OutfitLayerSimple
    {
        public Guid Id { get; set; }
        public string ColorName { get; set; }
        public OutfitType OutfitType { get; set; }
        public Guid? SourcePackageId { get; set; }
        public int Order { get; set; }
        public bool IsMergedLayer { get; set; }
    }
    public class OutfitLayerSimpleConfig : IEntityTypeConfiguration<OutfitLayerSimple>
    {
        public void Configure(EntityTypeBuilder<OutfitLayerSimple> builder)
        {
            builder.ToView("dummy view");
        }
    }

    public static class OutfitLayerSimpleExtension
    {
        public static OutfitLayer ToLayer(this OutfitLayerSimple layer)
        {
            return new OutfitLayer
            {
                Id = layer.Id,
                ColorName = layer.ColorName,
                OutfitType = layer.OutfitType,
                SourcePackageId = layer.SourcePackageId
            };
        }
    }
}
