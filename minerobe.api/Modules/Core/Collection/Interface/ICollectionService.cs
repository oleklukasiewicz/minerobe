using minerobe.api.Modules.Core.Collection.Entity;
using minerobe.api.Modules.Core.Package.Entity;

namespace minerobe.api.Modules.Core.Collection.Interface
{
    public interface ICollectionService
    {
        Task<OutfitPackageCollection> Add(OutfitPackageCollection collection);
        Task<bool> AddPackageToCollection(Guid collectionId, Guid packageId);
        Task<bool> Delete(Guid id);
        Task<OutfitPackageCollection> GetById(Guid id, bool loadItems = true);
        Task<bool> RemovePackageFromCollection(Guid collectionId, Guid packageId);
        Task<OutfitPackageCollection> Update(OutfitPackageCollection collection);
        IQueryable<OutfitPackage> GetPackagesOfCollection(Guid collectionId);
        Task<List<OutfitPackage>> GetCollectionsItems(Guid id);
    }
}