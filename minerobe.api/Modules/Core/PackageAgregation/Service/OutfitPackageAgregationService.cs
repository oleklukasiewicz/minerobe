using minerobe.api.Database;
using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.PackageAgregation.Entity;
using minerobe.api.Modules.Core.PackageAgregation.Interface;

namespace minerobe.api.Modules.Core.PackageAgregation.Service
{

    public class OutfitPackageAgregationService : IOutfitPackageAgregationService
    {
        private readonly BaseDbContext _context;
        public OutfitPackageAgregationService(BaseDbContext context)
        {
            _context = context;
        }
        public IQueryable<OutfitPackageAgregation> GetAgregation(Guid? collectionId = null)
        {
            var outfits = from p in _context.OutfitPackages
                          join s in _context.SocialDatas on p.SocialDataId equals s.Id
                          join u in _context.MinerobeUsers on p.PublisherId equals u.Id
                          join wm in _context.WardrobeMatchings on p.Id equals wm.OutfitPackageId into wmGroup
                          from wm in wmGroup.DefaultIfEmpty()
                          join plm in _context.PackageLayerMatchings on p.Id equals plm.PackageId into plmGroup
                          from plm in plmGroup.DefaultIfEmpty()
                          join l in _context.OutfitLayers on plm.LayerId equals l.Id into lGroup
                          from l in lGroup.DefaultIfEmpty()
                          select new OutfitPackageAgregation
                          {
                              Id = p.Id,
                              Name = p.Name,
                              Type = p.Type,
                              PackageColorName = p.ColorName,
                              PublisherName = u.Name,
                              CreatedAt = p.CreatedAt,
                              ModifiedAt = p.ModifiedAt,
                              ColorName = l.ColorName,
                              OutfitType = p.Type == PackageType.Set ? OutfitType.Set : l.OutfitType,
                              Downloads = s.Downloads,
                              IsFeatured = s.IsFeatured,
                              Likes = s.Likes,
                              IsShared = s.IsShared,
                              LayerId = l.Id,
                              LayerSourcePackageId = l.SourcePackageId,
                              WardrobeId = wm.WardrobeId,
                              PublisherId = p.PublisherId
                          };
            if (collectionId != null)
            {
                outfits = from o in outfits
                          join c in _context.OutfitPackageCollectionMatchings on o.Id equals c.PackageId into collectionGroup
                          from c in collectionGroup.DefaultIfEmpty()
                          where c == null || c.CollectionId == collectionId.Value
                          select new OutfitPackageAgregation
                          {
                              Id = o.Id,
                              Name = o.Name,
                              Type = o.Type,
                              PackageColorName = o.PackageColorName,
                              PublisherName = o.PublisherName,
                              CreatedAt = o.CreatedAt,
                              ModifiedAt = o.ModifiedAt,
                              ColorName = o.ColorName,
                              OutfitType = o.OutfitType,
                              Downloads = o.Downloads,
                              IsFeatured = o.IsFeatured,
                              Likes = o.Likes,
                              IsShared = o.IsShared,
                              LayerId = o.LayerId,
                              LayerSourcePackageId = o.LayerSourcePackageId,
                              WardrobeId = o.WardrobeId,
                              IsInCollection = c != null,
                              PublisherId = o.PublisherId
                          };

            }
            return outfits;
        }
        public IQueryable<OutfitPackage> FromAgregation(IQueryable<OutfitPackageAgregation> agregations)
        {
            var ids = agregations.GroupBy(x => x.Id).Select(x => x.Key);
            return FromIdList(ids);
        }
        public IQueryable<OutfitPackage> FromAgregationSingleLayer(IQueryable<OutfitPackageAgregation> agregations)
        {
            var packages = from a in agregations
                           join p in _context.OutfitPackages on a.Id equals p.Id
                           join s in _context.SocialDatas on p.SocialDataId equals s.Id
                           join u in _context.MinerobeUsers on p.PublisherId equals u.Id
                           join l in _context.OutfitLayers on a.LayerId equals l.Id
                           where a.Id == a.LayerSourcePackageId
                           select new OutfitPackage
                           {
                               Id = p.Id,
                               Name = p.Name,
                               Model = p.Model,
                               Type = p.Type,
                               ColorName = p.ColorName,
                               PublisherId = p.PublisherId,
                               Description = p.Description,
                               SocialDataId = p.SocialDataId,
                               Social = s,
                               OutfitType = l.OutfitType,
                               CreatedAt = p.CreatedAt,
                               ModifiedAt = p.ModifiedAt,
                               Layers = new List<OutfitLayer> { l },
                               Publisher = u
                           };
            return packages;
        }
        public IQueryable<OutfitPackage> FromIdList(IQueryable<Guid> ids)
        {
            var packages = from p in _context.OutfitPackages
                           join a in ids on p.Id equals a
                           join s in _context.SocialDatas on p.SocialDataId equals s.Id
                           join u in _context.MinerobeUsers on p.PublisherId equals u.Id
                           select new OutfitPackage
                           {
                               Id = p.Id,
                               Name = p.Name,
                               Model = p.Model,
                               Type = p.Type,
                               ColorName = p.ColorName,
                               PublisherId = p.PublisherId,
                               Description = p.Description,
                               SocialDataId = p.SocialDataId,
                               Social = s,
                               OutfitType = p.OutfitType,
                               CreatedAt = p.CreatedAt,
                               ModifiedAt = p.ModifiedAt,
                               Layers = (from lm in _context.PackageLayerMatchings
                                         join l in _context.OutfitLayers on lm.LayerId equals l.Id
                                         where lm.PackageId == p.Id
                                         orderby lm.IsPrimary descending, lm.Order
                                         select l).ToList(),
                               Publisher = u
                           };
            return packages;
        }

        public IQueryable<OutfitPackageAgregationResponse> FromAgregationWithUserContext(IQueryable<OutfitPackageAgregation> agregations, Guid? wardobeId)
        {
            var fromAggr = FromAgregation(agregations);
            var aggrWithUserContext = from p in fromAggr
                                      join w in _context.WardrobeMatchings on p.Id equals w.OutfitPackageId into wmGroup
                                      select new OutfitPackageAgregationResponse
                                      {
                                          Package = p,
                                          IsInWardrobe = wmGroup.Any(w => w.WardrobeId == wardobeId),
                                          IsInCollection = false
                                      };
            return aggrWithUserContext;
        }
        public IQueryable<OutfitPackageAgregationResponse> FromAgregationWithCollectionContext(IQueryable<OutfitPackageAgregation> agregations, Guid collectionId)
        {
            var fromAggr = FromAgregation(agregations);
            var aggrWithCollectionContext = from p in fromAggr
                                            join c in _context.OutfitPackageCollectionMatchings on p.Id equals c.PackageId into collectionGroup
                                            select new OutfitPackageAgregationResponse
                                            {
                                                Package = p,
                                                IsInWardrobe = false,
                                                IsInCollection = collectionGroup.Any(c => c.CollectionId == collectionId)
                                            };
            return aggrWithCollectionContext;
        }
        public IQueryable<OutfitPackageAgregationResponse> FromAgregationWithNoContext(IQueryable<OutfitPackageAgregation> agregations)
        {
            var fromAggr = FromAgregation(agregations);
            var aggrWithNoContext = from p in fromAggr
                                    select new OutfitPackageAgregationResponse
                                    {
                                        Package = p,
                                        IsInWardrobe = false,
                                        IsInCollection = false
                                    };
            return aggrWithNoContext;
        }
    }
}