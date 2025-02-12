using Microsoft.EntityFrameworkCore;
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
        public IQueryable<OutfitPackageAgregation> GetAgregation()
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
                              PublisherName = u.Name,
                              CreatedAt = p.CreatedAt,
                              ModifiedAt = p.ModifiedAt,
                              ColorName = l.ColorName,
                              OutfitType = l.OutfitType,
                              Downloads = s.Downloads,
                              IsFeatured = s.IsFeatured,
                              Likes = s.Likes,
                              IsShared = s.IsShared,
                              LayerId = l.Id,
                              WardrobeId = wm.WardrobeId,
                              PublisherId = p.PublisherId
                          };
            return outfits;
        }
        public IQueryable<OutfitPackage> FromAgregation(IQueryable<OutfitPackageAgregation> agregations)
        {
            var ids = agregations.GroupBy(x => x.Id).Select(x => x.Key);
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
                                         select l).ToList(),
                               Publisher = u
                           };

            return packages;
        }
        public IQueryable<OutfitPackage> FromAgregationSingleLayer(IQueryable<OutfitPackageAgregation> agregations)
        {
            var packages = from a in agregations
                           join p in _context.OutfitPackages on a.Id equals p.Id
                           join s in _context.SocialDatas on p.SocialDataId equals s.Id
                           join u in _context.MinerobeUsers on p.PublisherId equals u.Id
                           join l in _context.OutfitLayers on a.LayerId equals l.Id
                           select new OutfitPackage
                           {
                               Id = p.Id,
                               Name = p.Name,
                               Model = p.Model,
                               Type = p.Type,
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
                                         select l).ToList(),
                               Publisher = u
                           };
            return packages;
        }

        public IQueryable<OutfitPackageAgregationResponse> FromAgregationWithUserContext(IQueryable<OutfitPackageAgregation> agregations, Guid? wardobeId)
        {
            var ids = agregations.GroupBy(x => x.Id).Select(x => x.Key);
            var packages = from p in _context.OutfitPackages
                           join a in ids on p.Id equals a
                           join s in _context.SocialDatas on p.SocialDataId equals s.Id
                           join u in _context.MinerobeUsers on p.PublisherId equals u.Id
                           select new OutfitPackageAgregationResponse
                           {
                               Package = new OutfitPackage
                               {
                                   Id = p.Id,
                                   Name = p.Name,
                                   Model = p.Model,
                                   Type = p.Type,
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
                                             select l).ToList(),
                                   Publisher = u
                               },
                               IsInWardrobe = _context.WardrobeMatchings.Any(x => x.WardrobeId == wardobeId && x.OutfitPackageId == p.Id)
                           };

            return packages;
        }
    }
}
