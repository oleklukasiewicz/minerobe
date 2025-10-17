using minerobe.api.Helpers.Filter;
using minerobe.api.Modules.Core.Collection.Entity;
using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.Social.Entity;

namespace minerobe.api.Modules.Core.Wardrobe.Interface
{
    public interface IWardrobeService
    {
        Task<SocialData> AddToWadrobe(Guid wardrobeId, Guid outfitId);
        Task<Helpers.Wardrobe> Get(Guid id);
        Task<SocialData> RemoveFromWardrobe(Guid wardrobeId, Guid outfitId);
        Task<bool> IsPackageInWardrobe(Guid wardrobeId, Guid outfitId);
        Task<IQueryable<OutfitPackage>> GetWardrobeOutfits(Guid wardrobeId, OutfitFilter filter);
        Task<SocialData> AddCollectionToWadrobe(Guid wardrobeId, Guid collectionId);
        Task<SocialData> RemoveCollectionFromWardrobe(Guid wardrobeId, Guid collectionId);
        Task<IQueryable<OutfitPackageCollection>> GetWardrobeCollections(Guid wardrobeId, SimpleFilter filter);
        Task<IQueryable<OutfitPackage>> GetWardrobeOutfitsSingleLayer(Guid wardrobeId, OutfitFilter filter);

        Task<bool> RemovePackageFromAllWadrobes(Guid packageId);
        Task<bool> RemoveCollectionFromAllWadrobes(Guid collectionId);
    }
}