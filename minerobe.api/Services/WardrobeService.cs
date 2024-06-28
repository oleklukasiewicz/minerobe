using Microsoft.EntityFrameworkCore;
using minerobe.api.Database;
using minerobe.api.Entity;
using minerobe.api.Entity.Collection;
using minerobe.api.Entity.Package;
using minerobe.api.Entity.Wardrobe;
using minerobe.api.Helpers;
using minerobe.api.Helpers.Model;
using minerobe.api.Helpers.WardrobeHelpers;
using minerobe.api.Services.Interface;

namespace minerobe.api.Services
{
    public class WardrobeService : IWardrobeService
    {
        private readonly BaseDbContext _context;
        private readonly IPackageService _packageService;
        private readonly ISocialService _socialService;
        private readonly ICollectionService _collectionService;
        public WardrobeService(BaseDbContext context, IPackageService packageService, ISocialService socialService, ICollectionService collectionService)
        {
            _context = context;
            _packageService = packageService;
            _socialService = socialService;
            _collectionService = collectionService;
        }
        public async Task<Wardrobe> Get(Guid id)
        {
            var wardrobe = await _context.Wardrobes.Where(x => x.OwnerId == id).FirstOrDefaultAsync();
            if (wardrobe == null)
                return null;
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

            //studio 
            if (wardrobe.StudioId != null)
            {
                var studio = await _packageService.GetById(wardrobe.StudioId.Value);

                if (studio != null)
                    wardrobe.Studio = studio;
            }

            return wardrobe;
        }
        public async Task<Wardrobe> Add(Wardrobe wardrobe)
        {
            wardrobe.Id = Guid.NewGuid();
            await _context.Wardrobes.AddAsync(wardrobe);
            await _context.SaveChangesAsync();
            return await Get(wardrobe.Id);
        }
        public async Task<bool> SetStudio(Guid wardrobeId, OutfitPackage outfit)
        {
            var wardrobe = await _context.Wardrobes.Where(x => x.Id == wardrobeId).FirstOrDefaultAsync();
            if (wardrobe == null)
                return false;

            wardrobe.StudioId = outfit.Id;
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> SetStudio(Guid wardrobeId, Guid outfitId)
        {
            var outfit = await _context.OutfitPackages.Where(x => x.Id == outfitId).FirstOrDefaultAsync();
            if (outfit == null)
                return false;

            return await SetStudio(wardrobeId, outfit);
        }
        public async Task<SocialData> AddToWadrobe(Guid wardrobeId, Guid outfitId)
        {
            var wardrobe = await _context.Wardrobes.Where(x => x.Id == wardrobeId).FirstOrDefaultAsync();
            if (wardrobe == null)
                return null;
            var outfitref = await _context.OutfitPackages.Where(x => x.Id == outfitId).FirstOrDefaultAsync();

            if (outfitref == null)
                return null;
            //getcsocialdata
            outfitref.Social = await _socialService.GetById(outfitref.SocialDataId);
            //credentials
            if (outfitref.PublisherId != wardrobe.OwnerId && outfitref.Social.IsShared == false)
                return null;

            //check if not already added
            var matching = await _context.WardrobeMatchings.Where(x => x.OutfitPackageId == outfitref.Id && x.WardrobeId == wardrobeId).FirstOrDefaultAsync();
            if (matching != null)
                return null;

            //add matching

            var metching = new WardrobeMatching()
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
            var wardrobe = await _context.Wardrobes.Where(x => x.Id == wardrobeId).FirstOrDefaultAsync();
            if (wardrobe == null)
                return null;

            var collection = await _context.OutfitPackageCollections.Where(x => x.Id == collectionId).FirstOrDefaultAsync();
            if (collection == null)
                return null;

            if (collection.PublisherId != wardrobe.OwnerId && collection.Social.IsShared == false)
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

        public async Task<List<OutfitPackage>> GetWardrobeOutfits(Guid wardrobeId, TypeFilter filter)
        {
            var wardrobe = await _context.Wardrobes.Where(x => x.Id == wardrobeId).FirstOrDefaultAsync();
            if (wardrobe == null)
                return null;

            var matchings = await _context.WardrobeMatchings.Where(x => x.WardrobeId == wardrobeId).OrderBy(x => x.OutfitPackageId).ToListAsync();
            var outfits = new List<OutfitPackage>();
            foreach (var matching in matchings)
            {
                var outfit = await _packageService.GetById(matching.OutfitPackageId);
                if (outfit != null)
                    outfits.Add(outfit);
            }

            if (filter != null)
            {
                if (!string.IsNullOrEmpty(filter.Type))
                    outfits = outfits.Where(x => x.Type.ToString().ToLower() == filter.Type.ToLower()).ToList();
                if (!string.IsNullOrEmpty(filter.Phrase))
                    outfits = outfits.Where(x => x.Name.Contains(filter.Phrase)).ToList();
                if (!string.IsNullOrEmpty(filter.OutfitType))
                    outfits = outfits.Where(x => x.OutfitType.ToString() == filter.OutfitType).ToList();
                if (filter.Colors != null && filter.Colors.Count > 0)
                {
                    outfits = outfits.Where(x =>
                    {
                        return x.Layers.Any(y =>
                        {
                            return filter.Colors.Contains(y.Alex.ColorName) || filter.Colors.Contains(y.Steve.ColorName);
                        });
                    }).ToList();
                }
            }

            return outfits;
        }
        public async Task<List<OutfitPackageCollection>> GetWardrobeCollections(Guid wardrobeId, SimpleFilter filter)
        {
            var wardrobe = await _context.Wardrobes.Where(x => x.Id == wardrobeId).FirstOrDefaultAsync();
            if (wardrobe == null)
                return null;

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
        public async Task<bool> IsPackageInWardrobe(Guid userId, Guid outfitId)
        {
            var wardrobe = await _context.Wardrobes.Where(x => x.OwnerId == userId).FirstOrDefaultAsync();
            if (wardrobe == null)
                return false;
            var matching = await _context.WardrobeMatchings.Where(x => x.OutfitPackageId == outfitId && x.WardrobeId == wardrobe.Id).FirstOrDefaultAsync();
            return matching != null;
        }

        public async Task<WadrobeSummary> GetWadrobeSummary(Guid wardrobeId)
        {
            var matchings = await _context.WardrobeMatchings.Where(x => x.WardrobeId == wardrobeId).ToListAsync();
            var outfits = new List<OutfitPackage>();
            foreach (var matching in matchings)
            {
                var outfit = await _packageService.GetById(matching.OutfitPackageId);
                if (outfit != null)
                    outfits.Add(outfit);
            }
            var summary = new WadrobeSummary();
            summary.OutfitTypes = new List<WadrobeSummaryOutfitType>();
            foreach (var outfit in outfits)
            {
                var type = summary.OutfitTypes.Where(x => x.OutfitType == outfit.OutfitType.ToString()).FirstOrDefault();
                if (type == null)
                {
                    type = new WadrobeSummaryOutfitType()
                    {
                        OutfitType = outfit.OutfitType.ToString(),
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
    }
}
