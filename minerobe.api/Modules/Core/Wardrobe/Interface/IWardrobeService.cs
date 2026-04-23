using minerobe.api.Helpers.Filter;
using minerobe.api.Modules.Core.Collection.Entity;
using minerobe.api.Modules.Core.PackageAgregation.Entity;

namespace minerobe.api.Modules.Core.Wardrobe.Interface
{
    public interface IWardrobeService
    {
        Task<bool> AddToWadrobe(Guid wardrobeId, Guid outfitId);
        Task<Helpers.Wardrobe> Get(Guid id);
        Task<bool> RemoveFromWardrobe(Guid wardrobeId, Guid outfitId);
        Task<bool> IsPackageInWardrobe(Guid wardrobeId, Guid outfitId);
        Task<IQueryable<OutfitPackageAgregationResponse>> GetWardrobeOutfits(Guid wardrobeId, OutfitFilter filter, Guid? collectionId = null);
        Task<bool> AddCollectionToWadrobe(Guid wardrobeId, Guid collectionId);
        Task<bool> RemoveCollectionFromWardrobe(Guid wardrobeId, Guid collectionId);
        Task<IQueryable<OutfitPackageCollection>> GetWardrobeCollections(Guid wardrobeId, SimpleFilter filter);
        Task<IQueryable<OutfitPackageAgregationResponse>> GetWardrobeOutfitsSingleLayer(Guid wardrobeId, OutfitFilter filter);

        Task<bool> RemovePackageFromAllWadrobes(Guid packageId);
        Task<bool> RemoveCollectionFromAllWadrobes(Guid collectionId);
        Task<bool> RemoveCollectionFromExternalWardrobes(Guid collectionId);
        Task<bool> RemovePackageFromExternalWardrobes(Guid packageId);
    }
}