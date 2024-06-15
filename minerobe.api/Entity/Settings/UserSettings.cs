using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using minerobe.api.Entity.Package;
using minerobe.api.Extensions;

namespace minerobe.api.Entity.Settings
{
    public class UserSettings
    {
        public Guid Id { get; set; }
        public Guid OwnerId { get; set; }
        public string Theme { get; set; }
        public Guid? CurrentTexturePackageId { get; set; }
        public CurrentTextureConfig CurrentTexture { get; set; }
        public OutfitPackage? BaseTexture { get; set; }
        public UserLinkedAccount? LinkedAccount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
    }
    public class CurrentTextureConfig
    {
        public byte[] Texture { get; set; }
        public ModelType Model { get; set; }
        public bool IsFlat { get; set; }
    }
    public class UserSettingsConfig : IEntityTypeConfiguration<UserSettings>
    {
        public void Configure(EntityTypeBuilder<UserSettings> builder)
        {
            builder.Property(x => x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.BaseTexture).StoreAsJSON();
            builder.Property(x => x.OwnerId).IsRequired();
            builder.Property(x => x.LinkedAccount).StoreAsJSON();
            builder.Property(x=> x.CreatedAt).HasDefaultValueSql("getdate()");
            builder.Property(x=>x.CurrentTexture).StoreAsJSON();
        }
    }
}
