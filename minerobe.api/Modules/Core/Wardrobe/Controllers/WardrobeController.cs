using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Helpers;
using minerobe.api.Helpers.Filter;
using minerobe.api.Helpers.Model;
using minerobe.api.Modules.Core.Collection.ResponseModel;
using minerobe.api.Modules.Core.Package.Interface;
using minerobe.api.Modules.Core.User.Interface;
using minerobe.api.Modules.Core.Wardrobe.Interface;
using minerobe.api.Modules.Core.Wardrobe.ResponseModel;
using minerobe.api.ServicesHelpers.Interface;

namespace minerobe.api.Modules.Core.Wardrobe.Controllers
{
    [Route("Wardrobe")]
    [Authorize]
    public class WardrobeController : Controller
    {
        private readonly IWardrobeService _wardrobeService;
        private readonly IOutfitPackageServiceHelper _outfitHelper;
        private readonly IUserService _userService;
        private readonly IPackageService _packageService;
        public WardrobeController(IWardrobeService wardrobeService, IUserService userService, IPackageService packageService, IOutfitPackageServiceHelper outfitHelper)
        {
            _wardrobeService = wardrobeService;
            _userService = userService;
            _packageService = packageService;
            _outfitHelper = outfitHelper;
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
        [HttpPost("{id}")]
        public async Task<IActionResult> AddToWardrobe(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);

            var res = await _wardrobeService.AddToWadrobe(user.WardrobeId, id);
            if (res == null)
                return NotFound();
            return Ok(res);
        }
        [HttpDelete("{id}")]
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
        [HttpPost("{id}/collection")]
        public async Task<IActionResult> AddToCollection(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);

            var res = await _wardrobeService.AddCollectionToWadrobe(user.WardrobeId, id);
            if (res == null)
                return NotFound();
            return Ok(res);
        }
        [HttpDelete("{id}/collection")]
        public async Task<IActionResult> RemoveFromCollection(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);

            var res = await _wardrobeService.RemoveCollectionFromWardrobe(user.WardrobeId, id);
            if (res == null)
                return NotFound();
            return Ok(res);
        }
        [HttpPost("items")]
        public async Task<IActionResult> GetItems([FromBody] PagedOptions<OutfitFilter> options)
        {
            var user = await _userService.GetFromExternalUser(User);

            var res = await _wardrobeService.GetWardrobeOutfits(user.WardrobeId, options?.Filter);
            var paged = res.ToPagedResponse(options.Page, options.PageSize);

            var items = await _outfitHelper.ToOutfitPackage(paged);
            return Ok(paged.MapResponseOptions(items));
        }
        [HttpPost("collections")]
        public async Task<IActionResult> GetCollections([FromBody] PagedOptions<OutfitFilter> options)
        {
            var user = await _userService.GetFromExternalUser(User);

            var res = await _wardrobeService.GetWardrobeCollections(user.WardrobeId, options.Filter);
            return Ok(res.ToListItemResponseModel().ToPagedResponse(options.Page, options.PageSize));
        }
        [HttpPost("collections/context/{id}")]
        public async Task<IActionResult> GetCollectionsWithPackageContext(Guid id, [FromBody] PagedOptions<OutfitFilter> options)
        {
            var user = await _userService.GetFromExternalUser(User);

            var res = await _wardrobeService.GetWardrobeCollections(user.WardrobeId, options.Filter);
            return Ok(res.ToPackageResponseModel(id, true).ToPagedResponse(options.Page, options.PageSize));
        }

        [HttpPost("items/singleLayer")]
        public async Task<IActionResult> GetItemsSingleLayer([FromBody] PagedOptions<OutfitFilter> options)
        {
            var user = await _userService.GetFromExternalUser(User);

            var res = await _wardrobeService.GetWardrobeOutfitsSingleLayer(user.WardrobeId, options.Filter);
            var paged = res.ToPagedResponse(options.Page, options.PageSize);

            var items = await _outfitHelper.ToOutfitPackageSingleLayer(paged, true);

            return Ok(paged.MapResponseOptions(items));
        }
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var user = await _userService.GetFromExternalUser(User);

            var res = await _wardrobeService.GetWadrobeSummary(user.WardrobeId);
            return Ok(res);
        }
    }
}
