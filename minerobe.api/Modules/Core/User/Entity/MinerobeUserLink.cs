using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace minerobe.api.Modules.Core.User.Entity
{
    public class MinerobeUserLink
    {
        public Guid Id { get; set; }
        public string ExternalId { get; set; }
        public Guid MinerobeUserId { get; set; }
    }
    public class MinerobeUserLinkConfig : IEntityTypeConfiguration<MinerobeUserLink>
    {
        public void Configure(EntityTypeBuilder<MinerobeUserLink> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.Property(x => x.ExternalId).IsRequired();
            builder.Property(x => x.MinerobeUserId).IsRequired();
            builder.ToTable("UserLinks");
        }
    }
}
