using minerobe.api.Helpers.Model;
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
        Task<PackageAccessModel> GetAccess(Guid collectionId);
        Task<bool> CanAccess(Guid packageId, Guid userId);
        Task<bool> CanEdit(Guid packageId, Guid userId);
        IQueryable<OutfitPackage> GetPackagesOfCollection(Guid collectionId);
        Task<List<OutfitPackage>> GetCollectionsItems(Guid id);
    }
}