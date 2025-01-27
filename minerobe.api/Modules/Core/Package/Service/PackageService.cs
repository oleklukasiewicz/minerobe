using Microsoft.EntityFrameworkCore;
using minerobe.api.Database;
using minerobe.api.Entity.Package;
using minerobe.api.Helpers.Model;
using minerobe.api.Services.Interface;

namespace minerobe.api.Services
{
    public class PackageService : IPackageService
    {
        private readonly BaseDbContext _context;
        private readonly IUserService _userService;
        private readonly ISocialService _socialService;
        public PackageService(BaseDbContext context, IUserService userService, ISocialService socialService)
        {
            _context = context;
            _userService = userService;
            _socialService = socialService;
        }

        //package
        public async Task<OutfitPackage?> GetById(Guid id, Guid? layerId = null, bool isSnapshot = false)
        {
            var package = await _context.OutfitPackages.FindAsync(id);
            if (package == null)
                return null;

            //layers - snapshot,single for set
            if (layerId != null)
            {
                package.Layers = new List<OutfitLayer>() { await GetLayerById(layerId.Value) };
            }
            else
            {
                if (isSnapshot == true)
                {
                    var query = package.Type == PackageType.Set ?
                        _context.Set<OutfitLayerSimple>()
                           .Where(x => x.PackageId == id && x.IsMerged == true) :
                        _context.Set<OutfitLayerSimple>()
                            .Where(x => x.PackageId == id)
                            .OrderBy(x => x.Order);

                    package.Layers = query.Select(x => x.ToLayer()).ToList();

                    //load first only
                    if (package.Layers.Count > 0)
                    {
                        package.Layers[0] = await GetLayerById(package.Layers[0].Id);
                    }
                }
                else
                {
                    package.Layers = await GetLayersOfPackage(id);
                }
            }

            //type
            if (package.Type == PackageType.Outfit && package.Layers.Count > 0)
            {
                package.OutfitType = package.Layers[0].OutfitType;
            }

            //publisher
            var user = await _userService.GetById(package.PublisherId);
            if (user != null)
            {
                package.Publisher = user;
            }
            //social
            var social = await _socialService.GetById(package.SocialDataId);
            package.Social = social;

            return package;
        }
        public async Task<OutfitPackage> Add(OutfitPackage package)
        {
            package.Id = Guid.NewGuid();
            package.SocialDataId = await _socialService.CreateSocialEntry();

            var res = await _context.OutfitPackages.AddAsync(package);
            var packageId = res.Entity.Id;

            int i = 0;
            foreach (var layer in package.Layers)
            {
                if (layer.Id == Guid.Empty)
                {
                    layer.Id = Guid.NewGuid();
                    layer.SourcePackageId = packageId;
                    await _context.OutfitLayers.AddAsync(layer);
                }
                else
                {
                    var layerInDb = await _context.OutfitLayers.FindAsync(layer.Id);
                    if (layerInDb == null)
                    {
                        layer.Id = Guid.NewGuid();
                        layer.SourcePackageId = packageId;
                        await _context.OutfitLayers.AddAsync(layer);
                    }
                }
                await _context.PackageLayerMatchings.AddAsync(new PackageLayerMatching
                {
                    LayerId = layer.Id,
                    PackageId = package.Id,
                    Order = i
                });
                i++;
            }

            await _context.SaveChangesAsync();

            return await GetById(packageId);
        }
        public async Task<OutfitPackage?> Update(OutfitPackage package)
        {
            OutfitPackage? outfitPackage = await GetById(package.Id);

            if (outfitPackage == null)
                return null;

            //ignored fields
            package.ModifiedAt = DateTime.Now;
            package.CreatedAt = outfitPackage.CreatedAt;
            package.PublisherId = outfitPackage.PublisherId;
            package.SocialDataId = outfitPackage.SocialDataId;
            package.Social = outfitPackage.Social;
            package.Publisher = outfitPackage.Publisher;

            Type type = typeof(OutfitPackage);
            var properties = type.GetProperties();
            foreach (var property in properties)
            {
                property.SetValue(outfitPackage, property.GetValue(package));
            }

            _context.OutfitPackages.Update(outfitPackage);
            await _context.SaveChangesAsync();
            return outfitPackage;
        }
        public async Task<bool> Delete(Guid id)
        {
            var package = await GetById(id);
            if (package == null)
                return false;

            foreach (var layer in package.Layers)
            {
                var matchingsForLayer = await _context.PackageLayerMatchings.Where(x => x.LayerId == layer.Id).ToListAsync();
                foreach (var matching in matchingsForLayer)
                {
                    _context.PackageLayerMatchings.Remove(matching);
                }
                _context.OutfitLayers.Remove(layer);
            }

            _context.OutfitPackages.Remove(package);
            await _context.SaveChangesAsync();
            return true;
        }

        //layers
        public async Task<OutfitLayer> GetLayerById(Guid id)
        {
            var layer = await _context.OutfitLayers.Where(x => x.Id == id).FirstOrDefaultAsync();
            if (layer == null)
                return null;
            return layer;
        }
        public async Task<OutfitLayer> AddLayer(OutfitLayer layer, Guid packageId)
        {
            layer.Id = Guid.NewGuid();
            layer.SourcePackageId = packageId;
            var res = await _context.OutfitLayers.AddAsync(layer);
            var order = await GetLayersCount(packageId);

            await _context.PackageLayerMatchings.AddAsync(new PackageLayerMatching
            {
                LayerId = layer.Id,
                PackageId = packageId,
                Order = order
            });
            await _context.SaveChangesAsync();
            return await GetLayerById(layer.Id);
        }
        public async Task<OutfitLayer> UpdateLayer(OutfitLayer layer)
        {
            var layerInDb = await _context.OutfitLayers.FindAsync(layer.Id);
            if (layerInDb == null)
                return null;
            if (layer.Type == LayerType.Remote)
                return null;

            layer.Id = layerInDb.Id;
            layer.SourcePackageId = layerInDb.SourcePackageId;

            //copy props
            Type type = typeof(OutfitLayer);
            var properties = type.GetProperties();
            foreach (var property in properties)
            {
                property.SetValue(layerInDb, property.GetValue(layer));
            }
            _context.OutfitLayers.Update(layerInDb);
            await _context.SaveChangesAsync();
            return layerInDb;
        }
        public async Task<bool> DeleteLayer(Guid id)
        {
            var layer = await _context.OutfitLayers.FindAsync(id);
            if (layer == null)
                return false;

            var matchings = await _context.PackageLayerMatchings.Where(x => x.LayerId == id).ToListAsync();
            foreach (var matching in matchings)
            {
                _context.PackageLayerMatchings.Remove(matching);
            }
            _context.OutfitLayers.Remove(layer);
            await _context.SaveChangesAsync();
            await FillLayerOrder(layer.SourcePackageId.Value);
            return true;
        }

        //layers - remote
        public async Task<OutfitLayer> AddLayerToPackage(Guid layerId, Guid packageId)
        {
            var layer = await _context.OutfitLayers.FindAsync(layerId);
            if (layer == null)
                return null;
            var package = await _context.OutfitPackages.FindAsync(packageId);
            if (package == null)
                return null;

            //check if not alterady added
            var matching = await _context.PackageLayerMatchings.FirstOrDefaultAsync(x => x.LayerId == layerId && x.PackageId == packageId);
            if (matching != null)
                return null;

            var order = await GetLayersCount(packageId);

            await _context.PackageLayerMatchings.AddAsync(new PackageLayerMatching
            {
                LayerId = layerId,
                PackageId = packageId,
                Order = order
            });
            await _context.SaveChangesAsync();

            return await GetLayerById(layerId);
        }
        public async Task<bool> RemoveLayerFromPackage(Guid layerId, Guid packageId)
        {
            var matching = await _context.PackageLayerMatchings.FirstOrDefaultAsync(x => x.LayerId == layerId && x.PackageId == packageId);
            if (matching == null)
                return false;
            _context.PackageLayerMatchings.Remove(matching);
            await _context.SaveChangesAsync();
            await FillLayerOrder(packageId);
            return true;
        }

        //access
        public async Task<PackageAccessModel> GetPackageAccess(Guid packageId)
        {
            var package = await _context.OutfitPackages.FindAsync(packageId);
            var social = await _context.SocialDatas.Where(x => x.Id == package.SocialDataId).FirstOrDefaultAsync();

            var res = new PackageAccessModel
            {
                PackageId = packageId,
                UserId = package.PublisherId,
                IsShared = social.IsShared
            };
            return res;
        }
        public async Task<bool> CanAccessPackage(Guid packageId, Guid userId)
        {
            var access = await GetPackageAccess(packageId);
            if (access == null)
                return false;
            if (access.IsShared == true)
                return true;
            if (access.UserId == userId)
                return true;
            return false;
        }
        public async Task<bool> CanEditPackage(Guid packageId, Guid userId)
        {
            var access = await GetPackageAccess(packageId);
            if (access == null)
                return false;
            if (access.UserId == userId)
                return true;
            return false;
        }

        // update layers order
        public async Task<bool> UpdateLayerOrder(Guid packageId, List<Guid> layersInOrder)
        {
            for (int i = 0; i < layersInOrder.Count; i++)
            {
                var layerId = layersInOrder[i];
                var matching = await _context.PackageLayerMatchings.FirstOrDefaultAsync(x => x.LayerId == layerId && x.PackageId == packageId);
                if (matching == null)
                    return false;
                matching.Order = i;
                _context.PackageLayerMatchings.Update(matching);
            }
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<OutfitLayer> SetMergedLayer(OutfitLayer mergedLayer)
        {
            var layer = await _context.OutfitLayers.FirstOrDefaultAsync(x => x.SourcePackageId == mergedLayer.SourcePackageId && x.IsMerged == true);

            mergedLayer.IsMerged = true;

            if (layer != null)
            {
                layer.Alex = mergedLayer.Alex;
                layer.Steve = mergedLayer.Steve;
                layer.Type = mergedLayer.Type;
                layer.Name = mergedLayer.Name;
                layer.ColorName = mergedLayer.ColorName;
                layer.OutfitType = mergedLayer.OutfitType;

                _context.OutfitLayers.Update(layer);
            }
            else
            {
                mergedLayer.Id = Guid.NewGuid();
                await _context.OutfitLayers.AddAsync(mergedLayer);
                var matching = new PackageLayerMatching
                {
                    Id = Guid.NewGuid(),
                    LayerId = mergedLayer.Id,
                    PackageId = mergedLayer.SourcePackageId.Value,
                    Order = 0,
                };
                await _context.PackageLayerMatchings.AddAsync(matching);
            }
            await _context.SaveChangesAsync();
            return mergedLayer;
        }

        //helpers
        private async Task<List<OutfitLayer>> GetLayersOfPackage(Guid packageId)
        {
            var matchings = await _context.PackageLayerMatchings.Where(x => x.PackageId == packageId).OrderBy(x => x.Order).ToListAsync();
            var layers = new List<OutfitLayer>();
            foreach (var matching in matchings)
            {
                var layer = await _context.OutfitLayers.FindAsync(matching.LayerId);

                if (layer == null) continue;

                layers.Add(layer);
            }
            return layers;
        }
        private async Task<int> GetLayersCount(Guid packageId)
        {
            var count = await _context.PackageLayerMatchings.Where(x => x.PackageId == packageId).CountAsync();
            return count;
        }
        private async Task<bool> FillLayerOrder(Guid packageId)
        {
            var layers = await GetLayersOfPackage(packageId);
            int i = 0;
            foreach (var layer in layers)
            {
                var matching = await _context.PackageLayerMatchings.FirstOrDefaultAsync(x => x.LayerId == layer.Id && x.PackageId == packageId);
                if (matching == null)
                    return false;
                matching.Order = i;
                _context.PackageLayerMatchings.Update(matching);
                i++;
            }
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
