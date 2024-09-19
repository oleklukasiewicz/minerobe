using minerobe.api.Entity;
using minerobe.api.Entity.Collection;
using minerobe.api.Entity.Summary;
using minerobe.api.Helpers.Filter;
using minerobe.api.Helpers.Wardrobe;
using minerobe.api.Helpers.WardrobeHelpers;

namespace minerobe.api.Services.Interface
{
    public interface IWardrobeService
    {
        Task<SocialData> AddToWadrobe(Guid wardrobeId, Guid outfitId);
        Task<Wardrobe> Get(Guid id);
        Task<SocialData> RemoveFromWardrobe(Guid wardrobeId, Guid outfitId);
        Task<bool> IsPackageInWardrobe(Guid wardrobeId, Guid outfitId);
        Task<IQueryable<OutfitPackageAgregation>> GetWardrobeOutfits(Guid wardrobeId, OutfitFilter filter);
        Task<WadrobeSummary> GetWadrobeSummary(Guid wardrobeId);
        Task<SocialData> AddCollectionToWadrobe(Guid wardrobeId, Guid collectionId);
        Task<SocialData> RemoveCollectionFromWardrobe(Guid wardrobeId, Guid collectionId);
        Task<List<OutfitPackageCollection>> GetWardrobeCollections(Guid wardrobeId, SimpleFilter filter);
        Task<IQueryable<OutfitPackageAgregation>> GetWardrobeOutfitsSingleLayer(Guid wardrobeId, OutfitFilter filter);
    }
}