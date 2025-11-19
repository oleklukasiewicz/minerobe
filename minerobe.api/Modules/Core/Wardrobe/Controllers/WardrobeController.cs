using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Helpers;
using minerobe.api.Helpers.Filter;
using minerobe.api.Helpers.Model;
using minerobe.api.Modules.Core.Collection.Entity;
using minerobe.api.Modules.Core.Collection.Interface;
using minerobe.api.Modules.Core.Collection.ResponseModel;
using minerobe.api.Modules.Core.Package.Interface;
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
        public WardrobeController(IWardrobeService wardrobeService, IUserService userService, IPackageService packageService, ICollectionService collectionService)
        {
            _wardrobeService = wardrobeService;
            _userService = userService;
            _packageService = packageService;
            _collectionService = collectionService;
        }
        [HttpGet("")]
        public async Task<IActionResult> Get()
        {
            var user = await _userService.GetFromExternalUser(User);

            var wardrobe = await _wardrobeService.Get(user.WardrobeId);
            if (wardrobe == null)
                return NotFound();
            return Ok(wardrobe.ToResponseModel());
        }
        [HttpPost("item/{id}")]
        public async Task<IActionResult> AddToWardrobe(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);

            var res = await _wardrobeService.AddToWadrobe(user.WardrobeId, id);
            if (res == null)
                return NotFound();
            return Ok(res);
        }
        [HttpDelete("item/{id}")]
        public async Task<IActionResult> RemoveFromWardrobe(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);

            var package = await _packageService.GetById(id);
            if (package.PublisherId == user.Id)
                return BadRequest("You can't remove your own package from your wardrobe");

            var res = await _wardrobeService.RemoveFromWardrobe(user.WardrobeId, id);
            if (res == null)
                return NotFound();
            return Ok(res);
        }
        [HttpPost("collection/{id}")]
        public async Task<IActionResult> AddCollection(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);

            var res = await _wardrobeService.AddCollectionToWadrobe(user.WardrobeId, id);
            if (res == null)
                return NotFound();
            return Ok(res);
        }
        [HttpDelete("collection/{id}")]
        public async Task<IActionResult> RemoveCollection(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);

            var res = await _wardrobeService.RemoveCollectionFromWardrobe(user.WardrobeId, id);
            if (res == null)
                return NotFound();
            return Ok(res);
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
            var res = await _wardrobeService.GetWardrobeOutfits(user.WardrobeId, options.Filter,id);

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

            var items = paged.ToOutfitPackageSingleLayer(true);

            return Ok(paged.MapResponseOptions(items));
        }
    }
}
