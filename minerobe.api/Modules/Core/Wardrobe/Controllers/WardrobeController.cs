using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Helpers;
using minerobe.api.Helpers.Filter;
using minerobe.api.Helpers.Model;
using minerobe.api.Modules.Core.Collection.Entity;
using minerobe.api.Modules.Core.Collection.Interface;
using minerobe.api.Modules.Core.Collection.ResponseModel;
using minerobe.api.Modules.Core.Package.Interface;
using minerobe.api.Modules.Core.Permits.Interface;
using minerobe.api.Modules.Core.Social.Interface;
using minerobe.api.Modules.Core.User.Interface;
using minerobe.api.Modules.Core.Wardrobe.Interface;
using minerobe.api.Modules.Core.Wardrobe.ResponseModel;

namespace minerobe.api.Modules.Core.Wardrobe.Controllers
{
    [Route("Wardrobe")]
    [Authorize]
    public class WardrobeController : Controller
    {
        private readonly IWardrobeService _wardrobeService;
        private readonly IUserService _userService;
        private readonly IPackageService _packageService;
        private readonly ICollectionService _collectionService;
        private readonly IPermitsService _permitsService;
        private readonly ISocialService _socialService;
        public WardrobeController(IWardrobeService wardrobeService, IUserService userService, IPackageService packageService, ICollectionService collectionService, IPermitsService permitsService, ISocialService socialService)
        {
            _wardrobeService = wardrobeService;
            _userService = userService;
            _packageService = packageService;
            _collectionService = collectionService;
            _permitsService = permitsService;
            _socialService = socialService;
        }
        [HttpGet("")]
        public async Task<IActionResult> Get()
        {
            var user = await _userService.GetFromExternalUser(User);

            var wardrobe = await _wardrobeService.Get(user.WardrobeId);
            if (wardrobe == null)
                return NotFound();

            for (var i = 0; i < wardrobe.Outfits.Count; i++)
            {
                var outfit = await _packageService.GetById(wardrobe.Outfits[i].Id);
                if (outfit != null)
                    wardrobe.Outfits[i] = outfit;
            }

            for (var i = 0; i < wardrobe.Collections.Count; i++)
            {
                var collection = await _collectionService.GetById(wardrobe.Collections[i].Id);
                if (collection != null)
                    wardrobe.Collections[i] = collection;
            }

            return Ok(wardrobe.ToResponseModel());
        }
        [HttpPost("item/{id}")]
        public async Task<IActionResult> AddToWardrobe(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);

            var permits = await _permitsService.GetEntityPermits(id, EntityType.OUTFIT_PACKAGE);
            if (permits == null || (!permits.IsShared && permits.PublisherId != user.Id))
                return Forbid();

            var outfitPackage = await _packageService.GetById(id);
            if (outfitPackage == null)
                return NotFound();

            var res = await _wardrobeService.AddToWadrobe(user.WardrobeId, id);
            if (res != true)
                return BadRequest();

            var social = await _socialService.GetById(outfitPackage.SocialDataId);

            return Ok(social);
        }
        [HttpDelete("item/{id}")]
        public async Task<IActionResult> RemoveFromWardrobe(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);

            var package = await _packageService.GetById(id);
            if (package.PublisherId == user.Id)
                return BadRequest("You can't remove your own package from your wardrobe");

            var res = await _wardrobeService.RemoveFromWardrobe(user.WardrobeId, id);
            if (res != true)
                return BadRequest();

            var social = await _socialService.GetById(package.SocialDataId);

            return Ok(social);
        }
        [HttpPost("collection/{id}")]
        public async Task<IActionResult> AddCollection(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);

            var permits = await _permitsService.GetEntityPermits(id, EntityType.OUTFIT_COLLECTION);
            if (permits == null || (!permits.IsShared && permits.PublisherId != user.Id))
                return Forbid();

            var collection = await _collectionService.GetById(id);
            if (collection == null)
                return NotFound();

            var res = await _wardrobeService.AddCollectionToWadrobe(user.WardrobeId, id);

            if (res != true)
                return BadRequest();

            var social = await _socialService.GetById(collection.SocialDataId);

            return Ok(social);
        }
        [HttpDelete("collection/{id}")]
        public async Task<IActionResult> RemoveCollection(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);

            var collection = await _collectionService.GetById(id);
            if (collection.PublisherId == user.Id)
                return BadRequest("You can't remove your own collection from your wardrobe");

            var res = await _wardrobeService.RemoveCollectionFromWardrobe(user.WardrobeId, id);
            if (res != true)
                return BadRequest();

            var social = await _socialService.GetById(collection.SocialDataId);
            return Ok(social);
        }
        [HttpPost("items")]
        public async Task<IActionResult> GetItems([FromBody] PagedModel<OutfitFilter> options)
        {
            var user = await _userService.GetFromExternalUser(User);

            var res = await _wardrobeService.GetWardrobeOutfits(user.WardrobeId, options?.Filter);
            var paged = res.ToPagedResponse(options);

            var items = paged.ToOutfitPackageListItem();
            return Ok(paged.MapResponseOptions(items));
        }
        [HttpPost("collections")]
        public async Task<IActionResult> GetCollections([FromBody] PagedModel<OutfitFilter> options)
        {
            var user = await _userService.GetFromExternalUser(User);

            var res = await _wardrobeService.GetWardrobeCollections(user.WardrobeId, options.Filter);
            var paged = res.ToPagedResponse(options);

            var mappedCollections = paged.Items.Select(x => x.ToListItemResponseModel()).ToList();
            return Ok(paged.MapResponseOptions<OutfitPackageCollection, OutfitPackageCollectionListItemResponseModel>(mappedCollections));
        }
        [HttpPost("collections/context/{id}")]
        public async Task<IActionResult> GetCollectionsWithPackageContext(Guid id, [FromBody] PagedModel<OutfitFilter> options)
        {
            var user = await _userService.GetFromExternalUser(User);

            var res = await _wardrobeService.GetWardrobeCollections(user.WardrobeId, options.Filter);
            var paged = res.ToPagedResponse(options);

            var mappedCollections = paged.Items.Select(x => x.ToPackageResponseModel(id, true)).ToList();
            return Ok(paged.MapResponseOptions<OutfitPackageCollection, OutfitPackageCollectionPackageResponseModel>(mappedCollections));
        }
        [HttpPost("items/context/collection/{id}")]
        public async Task<IActionResult> GetItemsWithCollectionContext(Guid id, [FromBody] PagedModel<OutfitFilter> options)
        {
            var user = await _userService.GetFromExternalUser(User);
            var res = await _wardrobeService.GetWardrobeOutfits(user.WardrobeId, options.Filter, id);

            var paged = res.ToPagedResponse(options);
            var items = paged.ToOutfitPackageListItem();

            return Ok(paged.MapResponseOptions(items));
        }

        [HttpPost("items/singleLayer")]
        public async Task<IActionResult> GetItemsSingleLayer([FromBody] PagedModel<OutfitFilter> options)
        {
            var user = await _userService.GetFromExternalUser(User);

            var res = await _wardrobeService.GetWardrobeOutfitsSingleLayer(user.WardrobeId, options.Filter);

            var paged = res.ToPagedResponse(options);
            var items = paged.ToOutfitPackageListItem();

            return Ok(paged.MapResponseOptions(items));
        }
    }
}
