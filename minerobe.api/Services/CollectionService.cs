using Microsoft.EntityFrameworkCore;
using minerobe.api.Database;
using minerobe.api.Entity.Collection;
using minerobe.api.Entity.Package;
using minerobe.api.Helpers.Model;
using minerobe.api.Services.Interface;

namespace minerobe.api.Services
{
    public class CollectionService : ICollectionService
    {
        private readonly BaseDbContext _context;
        private readonly IPackageService _packageService;
        private readonly IUserService _userService;
        private readonly ISocialService _socialService;
        public CollectionService(BaseDbContext context, IPackageService packageService, IUserService userService, ISocialService socialService)
        {
            _context = context;
            _packageService = packageService;
            _userService = userService;
            _socialService = socialService;
        }
        public async Task<OutfitPackageCollection> Add(OutfitPackageCollection collection)
        {
            collection.Id = Guid.NewGuid();
            collection.SocialDataId = await _socialService.CreateSocialEntry();
            collection.Items = collection.Items ?? new List<OutfitPackage>();

            await _context.OutfitPackageCollections.AddAsync(collection);
            await _context.SaveChangesAsync();
            return await GetById(collection.Id);

        }
        public async Task<OutfitPackageCollection> GetById(Guid id)
        {
            var collection = await _context.OutfitPackageCollections.FindAsync(id);
            if (collection == null)
                return null;

            collection.Items = await GetPackagesOfCollection(id);
            collection.Social = await _socialService.GetById(collection.SocialDataId);

            var user = await _userService.GetById(collection.PublisherId);
            if (user != null)
            {
                collection.Publisher = user;
            }

            return collection;
        }
        public async Task<bool> Delete(Guid id)
        {
            var collection = await _context.OutfitPackageCollections.FindAsync(id);
            if (collection == null)
                return false;

            _context.OutfitPackageCollections.Remove(collection);

            var matchings = await _context.OutfitPackageCollectionMatchings
                .Where(x => x.CollectionId == id).ToListAsync();
            _context.OutfitPackageCollectionMatchings.RemoveRange(matchings);

            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<OutfitPackageCollection> Update(OutfitPackageCollection collection)
        {
            var oldCollection = await _context.OutfitPackageCollections.FindAsync(collection.Id);
            if (oldCollection == null)
                return null;

            collection.PublisherId = oldCollection.PublisherId;
            collection.SocialDataId = oldCollection.SocialDataId;
            collection.CreatedAt = oldCollection.CreatedAt;
            collection.ModifiedAt = DateTime.Now;

            Type type = typeof(OutfitPackageCollection);
            var properties = type.GetProperties();
            foreach (var property in properties)
            {
                property.SetValue(oldCollection, property.GetValue(collection));
            }
            collection.Items = collection.Items ?? new List<OutfitPackage>();

            await _context.SaveChangesAsync();
            return await GetById(collection.Id);
        }
        //add to collection
        public async Task<bool> AddPackageToCollection(Guid collectionId, Guid packageId)
        {
            var collection = await _context.OutfitPackageCollections.FindAsync(collectionId);
            if (collection == null)
                return false;

            var package = await _packageService.GetById(packageId);
            if (package == null)
                return false;
            //check if not already added
            var matching = await _context.OutfitPackageCollectionMatchings
                .FirstOrDefaultAsync(x => x.CollectionId == collectionId && x.PackageId == packageId);
            if (matching != null)
                return false;

            await _context.OutfitPackageCollectionMatchings.AddAsync(new OutfitPackageCollectionMatching
            {
                CollectionId = collectionId,
                PackageId = packageId
            });

            await _context.SaveChangesAsync();
            return true;
        }
        //remove from collection
        public async Task<bool> RemovePackageFromCollection(Guid collectionId, Guid packageId)
        {
            var collection = await _context.OutfitPackageCollections.FindAsync(collectionId);
            if (collection == null)
                return false;

            var package = await _packageService.GetById(packageId);
            if (package == null)
                return false;

            var matching = await _context.OutfitPackageCollectionMatchings
                .FirstOrDefaultAsync(x => x.CollectionId == collectionId && x.PackageId == packageId);
            if (matching == null)
                return false;

            _context.OutfitPackageCollectionMatchings.Remove(matching);
            await _context.SaveChangesAsync();
            return true;
        }


        //helpers
        private async Task<List<OutfitPackage>> GetPackagesOfCollection(Guid collectionId)
        {
            var packagesMatches = await _context.OutfitPackageCollectionMatchings
                .Where(x => x.CollectionId == collectionId).ToListAsync();
            var packages = new List<OutfitPackage>();

            foreach (var package in packagesMatches)
            {
                packages.Add(await _packageService.GetById(package.PackageId));
            }

            return packages;
        }
        //access
        public async Task<PackageAccessModel> GetAccess(Guid collectionId)
        {
            var package = await _context.OutfitPackageCollections.FindAsync(collectionId);
            var social = await _context.SocialDatas.Where(x => x.Id == package.SocialDataId).FirstOrDefaultAsync();

            var res = new PackageAccessModel
            {
                PackageId = collectionId,
                UserId = package.PublisherId,
                IsShared = social.IsShared
            };
            return res;
        }
        public async Task<bool> CanAccess(Guid packageId, Guid userId)
        {
            var access = await GetAccess(packageId);
            if (access == null)
                return false;
            if (access.IsShared == true)
                return true;
            if (access.UserId == userId)
                return true;
            return false;
        }
        public async Task<bool> CanEdit(Guid packageId, Guid userId)
        {
            var access = await GetAccess(packageId);
            if (access == null)
                return false;
            if (access.UserId == userId)
                return true;
            return false;
        }
    }
}
