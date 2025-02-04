using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using minerobe.api.Extensions;
using minerobe.api.Modules.Core.Package.Entity;

namespace minerobe.api.Modules.Core.Settings.Entity
{
    public class UserSettings
    {
        public Guid Id { get; set; }
        public Guid OwnerId { get; set; }
        public OutfitPackageConfig CurrentTexture { get; set; }
        public OutfitPackage BaseTexture { get; set; }
        public List<IntegrationMatching> Integrations { get; set; }
    }
    public class IntegrationMatching
    {
        public Guid Id { get; set; }
        public string Type { get; set; }
    }
    public class UserSettingsEntityConfig : IEntityTypeConfiguration<UserSettings>
    {
        public void Configure(EntityTypeBuilder<UserSettings> builder)
        {
            builder.Property(x => x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.BaseTexture).StoreAsJSON();
            builder.Property(x => x.OwnerId).IsRequired();
            builder.Property(x => x.CurrentTexture).StoreAsJSON();
            builder.Property(x => x.Integrations).StoreAsJSON();
        }
    }
    public static class UserSettingsExtension
    {
        public static bool ContainsIntegration(this UserSettings settings, string type)
        {
            return settings.Integrations.Any(x => x.Type.ToLower() == type.ToLower());
        }
    }
}
