using minerobe.api.Entity.Package;
using minerobe.api.Helpers.Model;

namespace minerobe.api.Services.Interface
{
    public interface IPackageService
    {
        Task<OutfitPackage> Add(OutfitPackage package);
        Task<OutfitLayer> AddLayer(OutfitLayer layer, Guid packageId);
        Task<OutfitLayer> AddLayerToPackage(Guid layerId, Guid packageId);
        Task<bool> Delete(Guid id);
        Task<OutfitLayer> GetLayerById(Guid id);
        Task<bool> DeleteLayer(Guid id);
        Task<OutfitPackage?> GetById(Guid id, Guid? layerId = null, bool isSnapshot = false);
        Task<bool> RemoveLayerFromPackage(Guid layerId, Guid packageId);
        Task<OutfitPackage?> Update(OutfitPackage package);
        Task<OutfitLayer> UpdateLayer(OutfitLayer layer);
        Task<PackageAccessModel> GetPackageAccess(Guid packageId);
        Task<bool> CanEditPackage(Guid packageId, Guid userId);
        Task<bool> CanAccessPackage(Guid packageId, Guid userId);
        Task<bool> UpdateLayerOrder(Guid packageId, List<Guid> layersInOrder);
        Task<OutfitPackage?>UpdateData(OutfitPackage package);
        Task<OutfitLayer> SetMergedLayer(OutfitLayer globalLayer);
    }
}