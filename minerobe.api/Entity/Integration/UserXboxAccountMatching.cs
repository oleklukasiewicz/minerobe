using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace minerobe.api.Entity.Integration
{
    public class UserXboxAccountMatching
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid XboxUserId { get; set; }
    }
    public class UserXboxAccountMatchingConfig : IEntityTypeConfiguration<UserXboxAccountMatching>
    {
        public void Configure(EntityTypeBuilder<UserXboxAccountMatching> builder)
        {
            builder.Property(x => x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.HasKey(x => x.Id);
            builder.ToTable("UserXboxAccountMatching","integration");
        }
    }
}
