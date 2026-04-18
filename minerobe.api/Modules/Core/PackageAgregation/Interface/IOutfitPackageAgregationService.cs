using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.PackageAgregation.Entity;

namespace minerobe.api.Modules.Core.PackageAgregation.Interface
{
    public interface IOutfitPackageAgregationService
    {
        IQueryable<OutfitPackage> FromAgregation(IQueryable<OutfitPackageAgregation> agregations);
        IQueryable<OutfitPackageAgregationResponse> FromAgregationSingleLayer(IQueryable<OutfitPackageAgregation> agregations, Guid? wardobeId = null);
        IQueryable<OutfitPackageAgregationResponse> FromAgregationWithUserContext(IQueryable<OutfitPackageAgregation> agregations, Guid? wardobeId = null);
        IQueryable<OutfitPackageAgregationResponse> FromAgregationWithCollectionContext(IQueryable<OutfitPackageAgregation> agregations, Guid collectionId);
        IQueryable<OutfitPackageAgregation> GetAgregation(Guid? collectionId = null);
        IQueryable<OutfitPackage> FromIdList(IQueryable<Guid> ids);
    }
}