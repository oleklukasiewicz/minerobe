using Microsoft.EntityFrameworkCore;
using minerobe.api.Database;
using minerobe.api.Entity.Agregation;
using minerobe.api.Helpers.Filter;
using minerobe.api.Helpers.Wardrobe;
using minerobe.api.Modules.Core.Collection.Entity;
using minerobe.api.Modules.Core.Collection.Interface;
using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.Package.Interface;
using minerobe.api.Modules.Core.Social.Entity;
using minerobe.api.Modules.Core.Social.Interface;
using minerobe.api.Modules.Core.User.Interface;
using minerobe.api.Modules.Core.Wardrobe.Entity;
using minerobe.api.Modules.Core.Wardrobe.Interface;

namespace minerobe.api.Modules.Core.Wardrobe.Service
{
    public class WardrobeService : IWardrobeService
    {
        private readonly BaseDbContext _context;
        private readonly IPackageService _packageService;
        private readonly ISocialService _socialService;
        private readonly ICollectionService _collectionService;
        private readonly IUserService _userService;
        public WardrobeService(BaseDbContext context, IPackageService packageService, ISocialService socialService, ICollectionService collectionService, IUserService userService)
        {
            _context = context;
            _packageService = packageService;
            _socialService = socialService;
            _collectionService = collectionService;
            _userService = userService;
        }
        public async Task<Helpers.Wardrobe.Wardrobe> Get(Guid id)
        {
            var user = await _userService.GetUserOfWardrobe(id);
            if (user == null)
                return null;

            var wardrobe = new Helpers.Wardrobe.Wardrobe();
            if (wardrobe.Outfits == null)
                wardrobe.Outfits = new List<OutfitPackage>();
            if (wardrobe.Collections == null)
                wardrobe.Collections = new List<OutfitPackageCollection>();

            var matchings = await _context.WardrobeMatchings.Where(x => x.WardrobeId == wardrobe.Id).ToListAsync();
            foreach (var matching in matchings)
            {
                var outfit = await _packageService.GetById(matching.OutfitPackageId);
                if (outfit != null)
                    wardrobe.Outfits.Add(outfit);
            }

            var collcetionMatchings = await _context.WardrobeCollectionMatchings.Where(x => x.WardrobeId == wardrobe.Id).ToListAsync();
            foreach (var matching in collcetionMatchings)
            {
                var collection = await _collectionService.GetById(matching.OutfitPackageCollectionId);
                if (collection != null)
                    wardrobe.Collections.Add(collection);
            }

            return wardrobe;
        }
        public async Task<SocialData> AddToWadrobe(Guid wardrobeId, Guid outfitId)
        {
            var user = await _userService.GetUserOfWardrobe(wardrobeId);
            if (user == null)
                return null;
            var outfitref = await _context.OutfitPackages.Where(x => x.Id == outfitId).FirstOrDefaultAsync();

            if (outfitref == null)
                return null;
            //getcsocialdata
            outfitref.Social = await _socialService.GetById(outfitref.SocialDataId);

            //credentials
            if (outfitref.PublisherId != user.Id && outfitref.Social.IsShared == false)
                return null;

            //check if not already added
            var matching = await _context.WardrobeMatchings.Where(x => x.OutfitPackageId == outfitref.Id && x.WardrobeId == wardrobeId).FirstOrDefaultAsync();
            if (matching != null)
                return null;

            //add matching

            var metching = new Entity.WardrobeMatching()
            {
                OutfitPackageId = outfitref.Id,
                WardrobeId = wardrobeId
            };
            await _context.WardrobeMatchings.AddAsync(metching);
            await _context.SaveChangesAsync();
            //add like

            var resp = await _socialService.Like(outfitref.Social.Id);

            return resp;
        }
        public async Task<SocialData> RemoveFromWardrobe(Guid wardrobeId, Guid outfitId)
        {
            var matching = await _context.WardrobeMatchings.Where(x => x.OutfitPackageId == outfitId && x.WardrobeId == wardrobeId).FirstOrDefaultAsync();
            if (matching == null)
                return null;
            _context.WardrobeMatchings.Remove(matching);
            await _context.SaveChangesAsync();
            var outfit = await _context.OutfitPackages.Where(x => x.Id == outfitId).FirstOrDefaultAsync();
            //remove like

            var resp = await _socialService.Unlike(outfit.Social.Id);

            return resp;
        }

        public async Task<SocialData> AddCollectionToWadrobe(Guid wardrobeId, Guid collectionId)
        {
            var user = await _userService.GetUserOfWardrobe(wardrobeId);
            if (user == null)
                return null;

            var collection = await _context.OutfitPackageCollections.Where(x => x.Id == collectionId).FirstOrDefaultAsync();
            if (collection == null)
                return null;


            if (collection.PublisherId != user.Id && collection.Social.IsShared == false)
                return null;

            collection.Social = await _socialService.GetById(collection.SocialDataId);

            //check if matching exists
            var matching = await _context.WardrobeCollectionMatchings.Where(x => x.OutfitPackageCollectionId == collectionId && x.WardrobeId == wardrobeId).FirstOrDefaultAsync();
            if (matching != null)
                return null;

            //add matching
            var metching = new WadrobeCollectionMatching()
            {
                OutfitPackageCollectionId = collectionId,
                WardrobeId = wardrobeId
            };

            await _context.WardrobeCollectionMatchings.AddAsync(metching);
            await _context.SaveChangesAsync();

            //add like
            var resp = await _socialService.Like(collection.Social.Id);

            return resp;

        }
        public async Task<SocialData> RemoveCollectionFromWardrobe(Guid wardrobeId, Guid collectionId)
        {
            var matching = await _context.WardrobeCollectionMatchings.Where(x => x.OutfitPackageCollectionId == collectionId && x.WardrobeId == wardrobeId).FirstOrDefaultAsync();
            if (matching == null)
                return null;
            _context.WardrobeCollectionMatchings.Remove(matching);
            await _context.SaveChangesAsync();
            var collection = await _context.OutfitPackageCollections.Where(x => x.Id == collectionId).FirstOrDefaultAsync();
            //remove like

            var resp = await _socialService.Unlike(collection.Social.Id);

            return resp;
        }
        public async Task<List<OutfitPackageCollection>> GetWardrobeCollections(Guid wardrobeId, SimpleFilter filter)
        {
            var matchings = await _context.WardrobeCollectionMatchings.Where(x => x.WardrobeId == wardrobeId).ToListAsync();
            var collections = new List<OutfitPackageCollection>();
            foreach (var matching in matchings)
            {
                var collection = await _collectionService.GetById(matching.OutfitPackageCollectionId);
                if (collection != null)
                    collections.Add(collection);
            }

            if (filter != null)
            {
                if (!string.IsNullOrEmpty(filter.Phrase))
                    collections = collections.Where(x => x.Name.Contains(filter.Phrase)).ToList();
            }

            return collections;
        }
        public async Task<bool> IsPackageInWardrobe(Guid wardrobeId, Guid outfitId)
        {
            var matching = await _context.WardrobeMatchings.Where(x => x.OutfitPackageId == outfitId && x.WardrobeId == wardrobeId).FirstOrDefaultAsync();
            return matching != null;
        }

        public async Task<WadrobeSummary> GetWadrobeSummary(Guid wardrobeId)
        {
            var matchings = await _context.WardrobeMatchings.Where(x => x.WardrobeId == wardrobeId).ToListAsync();
            var outfits = await GetWardrobeOutfits(wardrobeId, null);

            var summary = new WadrobeSummary();
            summary.OutfitTypes = new List<WadrobeSummaryOutfitType>();
            foreach (var outfit in outfits)
            {
                var type = summary.OutfitTypes.Where(x => x.OutfitType == ((OutfitType)outfit.OutfitType).ToString()).FirstOrDefault();
                if (type == null)
                {
                    type = new WadrobeSummaryOutfitType()
                    {
                        OutfitType = ((OutfitType)outfit.OutfitType).ToString(),
                        Count = 1
                    };
                    summary.OutfitTypes.Add(type);
                }
                else
                {
                    type.Count++;
                }
            }
            return summary;
        }

        public async Task<IQueryable<OutfitPackageAgregation>> GetWardrobeOutfits(Guid wardrobeId, OutfitFilter filter)
        {
            var outfits = _context.Set<OutfitPackageAgregation>().FromSqlInterpolated($"SELECT * FROM fGetWardrobeOutfits({wardrobeId})");
            if (filter != null)
            {
                outfits = filter.Filter(outfits);
            }
            return outfits;
        }
        public async Task<IQueryable<OutfitPackageAgregation>> GetWardrobeOutfitsSingleLayer(Guid wardrobeId, OutfitFilter filter)
        {
            var outfits = _context.Set<OutfitPackageAgregation>().FromSqlInterpolated($"SELECT * FROM fGetWardrobeOutfitsSingleLayer({wardrobeId})");
            outfits = outfits.OrderBy(x => x.Id);
            if (filter != null)
            {
                outfits = filter.Filter(outfits);
            }
            return outfits;
        }
    }
}
