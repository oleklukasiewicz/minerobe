using Microsoft.AspNetCore.Components.Forms;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using minerobe.api.Database;
using minerobe.api.Entity.Package;
using minerobe.api.Helpers.Model;
using minerobe.api.Model.Package;
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
        public async Task<OutfitPackage?> GetById(Guid id)
        {
            var package = await _context.OutfitPackages.FindAsync(id);
            if (package == null)
                return null;
            
            package.Layers = await GetLayersOfPackage(id);

            //type
            if (package.Type == PackageType.Set)
            {
                package.OutfitType = OutfitType.Set;
            }
            if (package.Type == PackageType.Outfit && package.Layers.Count > 0)
            {
                package.OutfitType = package.Layers[0].Steve.Type;
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
                }else
                {
                    var layerInDb = await _context.OutfitLayers.FindAsync(layer.Id);
                    if(layerInDb == null)
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

            var oldLayers = outfitPackage.Layers;

            //ignored fields
            package.ModifiedAt = DateTime.Now;
            package.CreatedAt = outfitPackage.CreatedAt;
            package.Id = outfitPackage.Id;
            package.PublisherId = outfitPackage.PublisherId;
            package.SocialDataId = outfitPackage.SocialDataId;

            Type type = typeof(OutfitPackage);
            var properties = type.GetProperties();
            foreach (var property in properties)
            {
                property.SetValue(outfitPackage, property.GetValue(package));
            }

            //layers

            //addings
            foreach (var layer in package.Layers)
            {
                if (layer.Id == Guid.Empty)
                    await AddLayer(layer, package.Id);
                else
                    await AddLayerToPackage(layer.Id, package.Id);
            }
            //deleting
            foreach (var layer in oldLayers)
            {
                var isExist = package.Layers.Where(x => x.Id == layer.Id).FirstOrDefault();
                if (isExist == null && layer.Id != Guid.Empty)
                {
                    if (layer.SourcePackageId == package.Id)
                        await DeleteLayer(layer.Id);
                    else
                        await RemoveLayerFromPackage(layer.Id, package.Id);
                }
            }
            //update
            foreach (var layer in package.Layers)
            {
                if (oldLayers.Contains(layer) && package.Id == layer.SourcePackageId) //only for layer owner
                {
                    var oldLayer = oldLayers.Where(x => x.Id == layer.Id).FirstOrDefault();
                    if (oldLayer != null)
                        await UpdateLayer(layer);
                }
            }

            _context.OutfitPackages.Update(outfitPackage);
            await _context.SaveChangesAsync();
            return outfitPackage;
        }
        public async Task<OutfitPackage?>UpdateData(OutfitPackage package)
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

        public async Task<PackageAccessModel> GetPackageAccess(Guid packageId)
        {
            var package = await _context.OutfitPackages.FindAsync(packageId);
            var social = await _context.SocialDatas.Where(x=> x.Id == package.SocialDataId).FirstOrDefaultAsync();

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

        public async Task<OutfitLayer> SetGlobalLayer(OutfitLayer globalLayer)
        {
            var matching = await _context.PackageLayerMatchings.FirstOrDefaultAsync(x => x.PackageId == globalLayer.SourcePackageId &&  x.IsGlobalLayer == true);
            if(matching!=null)
            {
                var layer = await _context.OutfitLayers.FindAsync(matching.LayerId);
                if(layer != null)
                {
                    layer.Alex = globalLayer.Alex;
                    layer.Steve = globalLayer.Steve;
                    layer.Type = globalLayer.Type;
                    layer.Name = globalLayer.Name;

                    _context.OutfitLayers.Update(layer);
                }
            }else
            {
                globalLayer.Id = Guid.NewGuid();
                await _context.OutfitLayers.AddAsync(globalLayer);
                matching = new PackageLayerMatching
                {
                    Id = Guid.NewGuid(),
                    LayerId = globalLayer.Id,
                    PackageId = globalLayer.SourcePackageId.Value,
                    Order = 0,
                    IsGlobalLayer = true
                };
                await _context.PackageLayerMatchings.AddAsync(matching);
            }
            await _context.SaveChangesAsync();
            return globalLayer;
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
                layer.IsGlobal = matching.IsGlobalLayer;
                
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
