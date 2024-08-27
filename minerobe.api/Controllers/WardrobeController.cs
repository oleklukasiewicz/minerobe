using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Database;
using minerobe.api.Helpers;
using minerobe.api.Helpers.Filter;
using minerobe.api.Helpers.Model;
using minerobe.api.ResponseModel.Collection;
using minerobe.api.ResponseModel.Package;
using minerobe.api.ResponseModel.Wardrobe;
using minerobe.api.Services.Interface;
using minerobe.api.ServicesHelpers.Interface;

namespace minerobe.api.Controllers
{
    [Route("Wardrobe")]
    [Authorize]
    public class WardrobeController : Controller
    {
        private readonly IWardrobeService _wardrobeService;
        private readonly IOutfitPackageServiceHelper _outfitHelper;
        private readonly IUserService _userService;
        private readonly IPackageService _packageService;
        public WardrobeController(IWardrobeService wardrobeService, IUserService userService, IPackageService packageService,IOutfitPackageServiceHelper outfitHelper)
        {
            _wardrobeService = wardrobeService;
            _userService = userService;
            _packageService = packageService;
            _outfitHelper = outfitHelper;
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var wardrobe = await _wardrobeService.Get(id);
            if (wardrobe == null)
                return NotFound();
            return Ok(wardrobe.ToResponseModel());
        }
        [HttpPost("{wardrobeId}/{id}")]
        public async Task<IActionResult> AddToWardrobe(Guid id, Guid wardrobeId)
        {
            var res = await _wardrobeService.AddToWadrobe(wardrobeId, id);
            if (res == null)
                return NotFound();
            return Ok(res);
        }
        [HttpDelete("{wardrobeId}/{id}")]
        public async Task<IActionResult> RemoveFromWardrobe(Guid id, Guid wardrobeId)
        {
            var wardrobe = await _wardrobeService.Get(wardrobeId);
            var package = await _packageService.GetById(id);
            var user= await _userService.GetUserOfWardrobe(wardrobeId);
            if (package.PublisherId == user.Id)
                return BadRequest("You can't remove your own package from your wardrobe");

            var res = await _wardrobeService.RemoveFromWardrobe(wardrobeId, id);
            if (res == null)
                return NotFound();
            return Ok(res);
        }
        [HttpPost("{wardrobeId}/{id}/collection")]
        public async Task<IActionResult> AddToCollection(Guid id, Guid wardrobeId)
        {
            var res = await _wardrobeService.AddCollectionToWadrobe(wardrobeId, id);
            if (res == null)
                return NotFound();
            return Ok(res);
        }
        [HttpDelete("{wardrobeId}/{id}/collection")]
        public async Task<IActionResult> RemoveFromCollection(Guid id, Guid wardrobeId)
        {
            var res = await _wardrobeService.RemoveCollectionFromWardrobe(wardrobeId, id);
            if (res == null)
                return NotFound();
            return Ok(res);
        }
        [HttpPost("{wardrobeId}/items")]
        public async Task<IActionResult> GetItems (Guid wardrobeId, [FromBody] PagedOptions<OutfitFilter> options)
        {
            var res = await _wardrobeService.GetWardrobeOutfits(wardrobeId, options?.Filter);
            var paged= res.ToPagedResponse(options.Page, options.PageSize);

            var items = await _outfitHelper.ToOutfitPackage(paged);

            return Ok(paged.MapResponseOptions(items));
        }
        [HttpPost("{wardrobeId}/collections")]
        public async Task<IActionResult> GetCollections(Guid wardrobeId, [FromBody] PagedOptions<OutfitFilter> options)
        {
            var res = await _wardrobeService.GetWardrobeCollections(wardrobeId, options.Filter);
            return Ok(res.ToListItemResponseModel().ToPagedResponse(options.Page, options.PageSize));
        }
        [HttpPost("{wardrobeId}/collections/{id}")]
        public async Task<IActionResult> GetCollectionsWithPackageContext(Guid wardrobeId,Guid id, [FromBody] PagedOptions<OutfitFilter> options)
        {
            var res = await _wardrobeService.GetWardrobeCollections(wardrobeId, options.Filter);
            return Ok(res.ToPackageResponseModel(id,true).ToPagedResponse(options.Page, options.PageSize));
        }

        [HttpPost("{wardrobeId}/items/singleLayer")]
        public async Task<IActionResult> GetItemsSingleLayer(Guid wardrobeId, [FromBody] PagedOptions<OutfitFilter> options)
        {
            var res = await _wardrobeService.GetWardrobeOutfitsSingleLayer(wardrobeId, options.Filter);
            var paged = res.ToPagedResponse(options.Page, options.PageSize);

            var items = await _outfitHelper.ToOutfitPackageSingleLayer(paged,true);

            return Ok(paged.MapResponseOptions(items));
        }
        [HttpGet("{wardrobeId}/summary")]
        public async Task<IActionResult> GetSummary(Guid wardrobeId)
        {
            var res = await _wardrobeService.GetWadrobeSummary(wardrobeId);
            return Ok(res);
        }
    }
}
