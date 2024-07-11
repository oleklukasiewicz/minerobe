using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using minerobe.api.Extensions;

namespace minerobe.api.Entity.Integration
{
    public class JavaXboxProfile
    {
        public Guid AccountId { get; set; }
        public string Username { get; set; }
        public List<JavaXboxSkin> Skins { get; set; }
        public List<JavaXboxCape> Capes { get; set; }
        public Guid? CurrentSkinId { get; set; }
        public Guid? CurrentCapeId { get; set; }
    }
    public class JavaXboxCape
    {
        public Guid? Id { get; set; }
        public byte[] Texture { get; set; }
        public string Name { get; set; }
    }
    public class JavaXboxSkin
    {
        public Guid? Id { get; set; }
        public byte[] Texture { get; set; }
        public string Name { get; set; }
    }
    public class JavaXboxProfileConfig: IEntityTypeConfiguration<JavaXboxProfile>
    {         
        public void Configure(EntityTypeBuilder<JavaXboxProfile> builder)
        {
            builder.Property(x => x.AccountId).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.HasKey(x => x.AccountId);
            builder.Property(x => x.Skins).StoreAsJSON();
            builder.Property(x => x.Capes).StoreAsJSON();
            builder.ToTable("JavaXboxProfile", "integration");
        }
    }
}
