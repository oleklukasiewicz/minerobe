using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace minerobe.api.Modules.Core.Social.Entity
{
    public class SocialData
    {
        public Guid Id { get; set; }
        public bool IsShared { get; set; }
        public int Likes { get; set; }
        public int Downloads { get; set; }
        public bool IsFeatured { get; set; }
    }
    public class SocialDataEntityConfig : IEntityTypeConfiguration<SocialData>
    {
        public void Configure(EntityTypeBuilder<SocialData> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.Property(x => x.Likes).HasDefaultValue(0);
            builder.Property(x => x.Downloads).HasDefaultValue(0);
            builder.Property(x => x.IsFeatured).HasDefaultValue(false);
            builder.Property(x => x.IsShared).HasDefaultValue(false);
            builder.ToTable("SocialData");
        }
    }
}
