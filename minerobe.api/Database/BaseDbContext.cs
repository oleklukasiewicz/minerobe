using Microsoft.EntityFrameworkCore;
using minerobe.api.Entity;
using minerobe.api.Entity.Collection;
using minerobe.api.Entity.Package;
using minerobe.api.Entity.Settings;
using minerobe.api.Entity.Summary;
using minerobe.api.Entity.User;
using minerobe.api.Entity.Wardrobe;
using System.Reflection;

namespace minerobe.api.Database
{
    public class BaseDbContext:DbContext
    {
        public DbSet<OutfitPackage> OutfitPackages { get; set; }
        public DbSet<OutfitPackageSummary> OutfitPackageSummarys { get; set; }
        public DbSet<OutfitLayer> OutfitLayers { get; set; }
        public DbSet<MinerobeUser> MinerobeUsers { get; set;}
        public DbSet<MinerobeUserLink> MinerobeUserLinks { get; set; }
        public DbSet<Wardrobe> Wardrobes { get; set; }
        public DbSet<WardrobeMatching> WardrobeMatchings { get; set; }
        public DbSet<WadrobeCollectionMatching> WardrobeCollectionMatchings { get; set; }
        public DbSet<PackageLayerMatching> PackageLayerMatchings { get; set; }
        public DbSet<OutfitPackageCollection> OutfitPackageCollections { get; set; }
        public DbSet<OutfitPackageCollectionMatching> OutfitPackageCollectionMatchings { get; set; }
        public DbSet<SocialData> SocialDatas { get; set; }
        public DbSet<UserSettings> UserSettings { get; set; }
        public BaseDbContext(DbContextOptions<BaseDbContext> options ):base(options)
        {
            
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
           base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }
    }
}
