using minerobe.api.Modules.Core.Package.Entity;

namespace minerobe.api.Modules.Core.Package.Interface
{
    public interface IPackageService
    {
        Task<OutfitPackage> Add(OutfitPackage package);
        Task<OutfitLayer> AddLayer(OutfitLayer layer, Guid packageId);
        Task<OutfitLayer> AddLayerToPackage(Guid layerId, Guid packageId);
        Task<bool> Delete(Guid id);
        Task<OutfitLayer> GetLayerById(Guid id);
        Task<bool> DeleteLayer(Guid id);
        Task<OutfitPackage> GetById(Guid id, Guid? layerId = null);
        Task<bool> RemoveLayerFromPackage(Guid layerId, Guid packageId);
        Task<OutfitPackage> Update(OutfitPackage package);
        Task<OutfitLayer> UpdateLayer(OutfitLayer layer);
        Task<bool> UpdateLayerOrder(Guid packageId, List<Guid> layersInOrder);
        Task<bool> UpdatePrimaryLayer(Guid packageId, Guid layerId);
        Task<bool> RemovePrimaryLayer(Guid packageId);
        Task<OutfitPackage> MergePackageLayers(Guid packageId, bool isFlatten = false, OutfitLayer basetexture = null, Guid? layerId = null);
        Task<OutfitLayer> GetPrimaryLayer(Guid packageId);
        Task<Guid> GetIdBySocialId(Guid id);
    }
}