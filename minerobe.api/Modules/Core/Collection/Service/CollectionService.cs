using Microsoft.EntityFrameworkCore;
using minerobe.api.Database;
using minerobe.api.Modules.Core.Collection.Entity;
using minerobe.api.Modules.Core.Collection.Interface;
using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.Package.Interface;

namespace minerobe.api.Modules.Core.Collection.Service
{
    public class CollectionService : ICollectionService
    {
        private readonly BaseDbContext _context;
        private readonly IPackageService _packageService;
        public CollectionService(BaseDbContext context, IPackageService packageService)
        {
            _context = context;
            _packageService = packageService;
        }
        public async Task<OutfitPackageCollection> Add(OutfitPackageCollection collection)
        {
            collection.Id = Guid.NewGuid();
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

            var matchings = await _context.OutfitPackageCollectionMatchings.Where(x => x.CollectionId == id).Select(x => new OutfitPackage { Id = x.PackageId }).ToListAsync();
            collection.Items = matchings;

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
    }
}
