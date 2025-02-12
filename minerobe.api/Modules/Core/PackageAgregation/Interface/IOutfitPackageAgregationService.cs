using Microsoft.EntityFrameworkCore;
using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.PackageAgregation.Entity;

namespace minerobe.api.Modules.Core.PackageAgregation.Interface
{
    public interface IOutfitPackageAgregationService
    {
        IQueryable<OutfitPackage> FromAgregation(IQueryable<OutfitPackageAgregation> agregations);
        IQueryable<OutfitPackage> FromAgregationSingleLayer(IQueryable<OutfitPackageAgregation> agregations);
        IQueryable<OutfitPackageAgregationResponse> FromAgregationWithUserContext(IQueryable<OutfitPackageAgregation> agregations, Guid? wardobeId);
        IQueryable<OutfitPackageAgregation> GetAgregation();
        IQueryable<OutfitPackage> FromIdList(IQueryable<Guid> ids);
    }
}