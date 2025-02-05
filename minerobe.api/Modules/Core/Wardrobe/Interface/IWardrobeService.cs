using minerobe.api.Entity.Agregation;
using minerobe.api.Helpers.Filter;
using minerobe.api.Modules.Core.Collection.Entity;
using minerobe.api.Modules.Core.Social.Entity;

namespace minerobe.api.Modules.Core.Wardrobe.Interface
{
    public interface IWardrobeService
    {
        Task<SocialData> AddToWadrobe(Guid wardrobeId, Guid outfitId);
        Task<Helpers.Wardrobe> Get(Guid id);
        Task<SocialData> RemoveFromWardrobe(Guid wardrobeId, Guid outfitId);
        Task<bool> IsPackageInWardrobe(Guid wardrobeId, Guid outfitId);
        Task<IQueryable<OutfitPackageAgregation>> GetWardrobeOutfits(Guid wardrobeId, OutfitFilter filter);
        Task<SocialData> AddCollectionToWadrobe(Guid wardrobeId, Guid collectionId);
        Task<SocialData> RemoveCollectionFromWardrobe(Guid wardrobeId, Guid collectionId);
        Task<List<OutfitPackageCollection>> GetWardrobeCollections(Guid wardrobeId, SimpleFilter filter);
        Task<IQueryable<OutfitPackageAgregation>> GetWardrobeOutfitsSingleLayer(Guid wardrobeId, OutfitFilter filter);
    }
}