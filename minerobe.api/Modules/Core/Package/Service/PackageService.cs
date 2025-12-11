using Microsoft.EntityFrameworkCore;
using minerobe.api.Database;
using minerobe.api.Helpers;
using minerobe.api.Helpers.Model;
using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.Package.Interface;
using minerobe.api.Modules.Core.Social.Interface;
using minerobe.api.Modules.Core.User.Interface;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Png;
using System.Text;

namespace minerobe.api.Modules.Core.Package.Service
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
        public async Task<OutfitPackage> GetById(Guid id, Guid? layerId = null)
        {
            var package = await _context.OutfitPackages.FindAsync(id);
            if (package == null)
                return null;

            var layersQuery = GetLayersOfPackage(id);

            // specific layerId
            if (layerId != null)
                layersQuery = layersQuery.Where(x => x.Id == layerId);

            package.Layers = await layersQuery.ToListAsync();

            //type
            if (package.Type == PackageType.Outfit && package.Layers.Count > 0)
                package.OutfitType = package.Layers[0].OutfitType;

            //publisher
            package.Publisher = await _userService.GetById(package.PublisherId);

            //social
            var social = await _socialService.GetById(package.SocialDataId);
            package.Social = social;

            return package;
        }
        public async Task<OutfitPackage> Add(OutfitPackage package)
        {
            package.Id = Guid.NewGuid();
            package.SocialDataId = await _socialService.Add();

            var res = await _context.OutfitPackages.AddAsync(package);
            var packageId = res.Entity.Id;

            for (int i = 0; i < package.Layers.Count; i++)
            {
                var layer = package.Layers[i];
                var newLayer = false;

                if (layer.Id == Guid.Empty)
                {
                    newLayer = true;
                }
                else
                {
                    var layerInDb = await _context.OutfitLayers.FindAsync(layer.Id);
                    if (layerInDb == null)
                        newLayer = true;

                }
                if (newLayer)
                {
                    layer.Id = Guid.NewGuid();
                    layer.SourcePackageId = packageId;
                    await _context.OutfitLayers.AddAsync(layer);
                }

                await _context.PackageLayerMatchings.AddAsync(new PackageLayerMatching
                {
                    LayerId = layer.Id,
                    PackageId = package.Id,
                    Order = i
                });
            }

            await _context.SaveChangesAsync();

            return await GetById(packageId);
        }
        public async Task<OutfitPackage> Update(OutfitPackage package)
        {
            OutfitPackage outfitPackage = await GetById(package.Id);

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

            if (package.Type == PackageType.Outfit)
            {
                var firstlayer = await GetNthPackageLayer(package.Id, 0);
                if (firstlayer != null)
                    outfitPackage.OutfitType = firstlayer.OutfitType;
            }
            else
            {
                outfitPackage.OutfitType = OutfitType.Set;
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
                var matchingsForLayerQuery = _context.PackageLayerMatchings.Where(x => x.LayerId == layer.Id);
                //if layer is from package
                if (layer.SourcePackageId != id)
                    matchingsForLayerQuery = matchingsForLayerQuery.Where(x => x.PackageId == id);

                var matchingsForLayer = await matchingsForLayerQuery.ToListAsync();
                foreach (var matching in matchingsForLayer)
                {
                    _context.PackageLayerMatchings.Remove(matching);
                }
                //if layer is from package - remove layer
                if (layer.SourcePackageId == id)
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
            return layer;
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

            return layer;
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

            var user = await _userService.GetById(userId);
            if (user == null)
                return false;
            if (user.IsAdmin)
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

            var user = await _userService.GetById(userId);
            if (user == null)
                return false;
            if (user.IsAdmin)
                return true;
            return false;
        }

        // update layers order
        public async Task<bool> UpdateLayerOrder(Guid packageId, List<Guid> layersInOrder)
        {
            var layersmatchings = await _context.PackageLayerMatchings.Where(x => x.PackageId == packageId).ToListAsync();
            for (int i = 0; i < layersInOrder.Count; i++)
            {
                var layerId = layersInOrder[i];
                var matching = layersmatchings.FirstOrDefault(x => x.LayerId == layerId);
                if (matching == null)
                    return false;

                if (matching.Order == i)
                    continue;

                matching.Order = i;
                _context.PackageLayerMatchings.Update(matching);
            }

            await _context.SaveChangesAsync();
            return true;
        }
        //primary layer
        public async Task<bool> UpdatePrimaryLayer(Guid packageId, Guid layerId)
        {
            await RemovePrimaryLayer(packageId);

            var newPrimary = await _context.PackageLayerMatchings.Where(x => x.PackageId == packageId && x.LayerId == layerId).FirstOrDefaultAsync();
            if (newPrimary == null)
                return false;
            newPrimary.IsPrimary = true;
            _context.PackageLayerMatchings.Update(newPrimary);

            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> RemovePrimaryLayer(Guid packageId)
        {
            var existingPrimary = await _context.PackageLayerMatchings.Where(x => x.PackageId == packageId && x.IsPrimary).FirstOrDefaultAsync();
            if (existingPrimary != null)
            {
                existingPrimary.IsPrimary = false;
                _context.PackageLayerMatchings.Update(existingPrimary);
            }
            await _context.SaveChangesAsync();
            return true;
        }

        //merger

        public async Task<OutfitPackage> MergePackageLayers(Guid packageId, bool isFlatten = false, OutfitLayer basetexture = null)
        {
            var layers = await GetLayersOfPackage(packageId).ToListAsync();
            if (basetexture != null)
            {
                layers.Insert(0, basetexture);
            }
            var steveMerged = await ImageMerger.Merge(layers.Select(x => x.Steve.Content).ToList(), ModelType.Steve, isFlatten);
            var alexMerged = await ImageMerger.Merge(layers.Select(x => x.Alex.Content).ToList(), ModelType.Alex, isFlatten);

            var package = await _context.OutfitPackages.FindAsync(packageId);
            if (package == null)
                return null;

            var mergedLayer = new OutfitLayer()
            {
                Steve = new FileData()
                {
                    Content = Encoding.UTF8.GetBytes(steveMerged.ToBase64String(PngFormat.Instance)),
                },
                Alex = new FileData()
                {
                    Content = Encoding.UTF8.GetBytes(alexMerged.ToBase64String(PngFormat.Instance)),
                },
            };
            mergedLayer.SourcePackageId = package.Id;
            mergedLayer.Type = LayerType.Local;
            mergedLayer.Name = "Merged";

            package.Layers = new List<OutfitLayer> { mergedLayer };
            return package;
        }


        //helpers
        private IQueryable<OutfitLayer> GetLayersOfPackage(Guid packageId)
        {
            var layers = from layer in _context.OutfitLayers
                         join matching in _context.PackageLayerMatchings
                         on layer.Id equals matching.LayerId
                         where matching.PackageId == packageId
                         orderby matching.Order
                         select layer;
            return layers;
        }
        private async Task<int> GetLayersCount(Guid packageId)
        {
            var count = await _context.PackageLayerMatchings.Where(x => x.PackageId == packageId).CountAsync();
            return count;
        }
        private async Task<bool> FillLayerOrder(Guid packageId)
        {
            var layers = await GetLayersOfPackage(packageId).ToListAsync();
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
        private async Task<OutfitLayer> GetNthPackageLayer(Guid packageId, int n)
        {
            var layer = await (from l in _context.OutfitLayers
                               join m in _context.PackageLayerMatchings on l.Id equals m.LayerId
                               where m.PackageId == packageId
                               orderby m.Order
                               select l).Skip(n).FirstOrDefaultAsync();
            return layer;
        }
        public async Task<OutfitLayer> GetPrimaryLayer(Guid packageId)
        {
            var layer = await (from l in _context.OutfitLayers
                               join m in _context.PackageLayerMatchings on l.Id equals m.LayerId
                               where m.PackageId == packageId && m.IsPrimary
                               select l).FirstOrDefaultAsync();
            return layer;
        }
    }
}
