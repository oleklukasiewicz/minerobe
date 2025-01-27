using Microsoft.EntityFrameworkCore;
using minerobe.api.Entity.Agregation;
using minerobe.api.Modules.Core.Collection.Entity;
using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.Settings.Entity;
using minerobe.api.Modules.Core.Social.Entity;
using minerobe.api.Modules.Core.User.Entity;
using minerobe.api.Modules.Core.Wardrobe.Entity;
using System.Reflection;

namespace minerobe.api.Database
{
    public class BaseDbContext : DbContext
    {
        public DbSet<OutfitPackage> OutfitPackages { get; set; }
        public DbSet<OutfitPackageAgregation> OutfitPackageAgregations { get; set; }
        public DbSet<OutfitLayer> OutfitLayers { get; set; }
        public DbSet<MinerobeUser> MinerobeUsers { get; set; }
        public DbSet<MinerobeUserLink> MinerobeUserLinks { get; set; }
        public DbSet<WardrobeMatching> WardrobeMatchings { get; set; }
        public DbSet<WadrobeCollectionMatching> WardrobeCollectionMatchings { get; set; }
        public DbSet<PackageLayerMatching> PackageLayerMatchings { get; set; }
        public DbSet<OutfitPackageCollection> OutfitPackageCollections { get; set; }
        public DbSet<OutfitPackageCollectionMatching> OutfitPackageCollectionMatchings { get; set; }
        public DbSet<SocialData> SocialDatas { get; set; }
        public DbSet<UserSettings> UserSettings { get; set; }
        public BaseDbContext(DbContextOptions<BaseDbContext> options) : base(options)
        {

        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }
    }
}
