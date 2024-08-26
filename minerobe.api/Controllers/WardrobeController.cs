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
        [HttpPost("{wardrobeId}/studio/{id}")]
        public async Task<IActionResult> SetStudio(Guid id, Guid wardrobeId)
        {
            var wardrobe = await _wardrobeService.Get(wardrobeId);
            if (wardrobe == null)
                return NotFound();
            var res = await _wardrobeService.SetStudio(wardrobe.Id, id);
            if (res == false)
                return NotFound();
            return Ok(res);
        }
        [HttpGet("{id}/studio")]
        public async Task<IActionResult> GetStudio(Guid id)
        {
            var res = await _wardrobeService.Get(id);
            if (res == null)
                return NotFound();
            var studio = res.Studio;
            return Ok(studio.ToResponseModel());
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
            if (package.PublisherId == wardrobe.OwnerId)
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
        [HttpPost("{wardrobeId}/{id}/collection/byUser")]
        public async Task<IActionResult> AddToCollectionUser(Guid id, Guid wardrobeId)
        {
            var wardrobe = await _wardrobeService.Get(wardrobeId);
            if (wardrobe == null) return NotFound();
            var res = await _wardrobeService.AddCollectionToWadrobe(wardrobe.Id, id);
            if (res == null)
                return NotFound();
            return Ok(res);
        }
        [HttpDelete("{wardrobeId}/{id}/collection/byUser")]
        public async Task<IActionResult> RemoveFromCollectionUser(Guid id, Guid wardrobeId)
        {
            var wardrobe = await _wardrobeService.Get(wardrobeId);
            if (wardrobe == null) return NotFound();
            var res = await _wardrobeService.RemoveCollectionFromWardrobe(wardrobe.Id, id);
            if (res == null)
                return NotFound();
            return Ok(res);
        }

        [HttpPost("{userId}/{id}/byUser")]
        public async Task<IActionResult> AddToWardrobeUser(Guid id, Guid userId)
        {     
            var wardobe = await _wardrobeService.Get(userId);
            if (wardobe == null) return NotFound();
            var res = await _wardrobeService.AddToWadrobe(wardobe.Id, id);
            if (res == null)
                return NotFound();
            return Ok(res);
        }
        [HttpDelete("{userId}/{id}/byUser")]
        public async Task<IActionResult> RemoveFromWardrobeUser(Guid id, Guid userId)
        {
            var package = await _packageService.GetById(id);
            if (package.PublisherId == userId)
                return BadRequest("You can't remove your own package from your wardrobe");

            var wardobe = await _wardrobeService.Get(userId);
            if (wardobe == null) return NotFound();
            var res = await _wardrobeService.RemoveFromWardrobe(wardobe.Id, id);
            if (res == null)
                return NotFound();
            return Ok(res);
        }
        [HttpPost("{userId}/items")]
        public async Task<IActionResult> GetItems (Guid userId, [FromBody] PagedOptions<OutfitFilter> options)
        {
            var wardrobe = await _wardrobeService.Get(userId);
            if (wardrobe == null)
                return NotFound();
            var res = await _wardrobeService.GetWardrobeOutfits(wardrobe.Id, options?.Filter);
            var paged= res.ToPagedResponse(options.Page, options.PageSize);

            var items = await _outfitHelper.ToOutfitPackage(paged);

            return Ok(paged.MapResponseOptions(items));
        }
        [HttpPost("{userId}/collections")]
        public async Task<IActionResult> GetCollections(Guid userId, [FromBody] PagedOptions<OutfitFilter> options)
        {
            var wardrobe = await _wardrobeService.Get(userId);
            if (wardrobe == null)
                return NotFound();
            var res = await _wardrobeService.GetWardrobeCollections(wardrobe.Id, options.Filter);
            return Ok(res.ToListItemResponseModel().ToPagedResponse(options.Page, options.PageSize));
        }
        [HttpPost("{userId}/collections/{id}")]
        public async Task<IActionResult> GetCollectionsWithPackageContext(Guid userId,Guid id, [FromBody] PagedOptions<OutfitFilter> options)
        {
            var wardrobe = await _wardrobeService.Get(userId);
            if (wardrobe == null)
                return NotFound();
            var res = await _wardrobeService.GetWardrobeCollections(wardrobe.Id, options.Filter);
            return Ok(res.ToPackageResponseModel(id,true).ToPagedResponse(options.Page, options.PageSize));
        }

        [HttpPost("{userId}/items/singleLayer")]
        public async Task<IActionResult> GetItemsSingleLayer(Guid userId, [FromBody] PagedOptions<OutfitFilter> options)
        {
            var wardrobe = await _wardrobeService.Get(userId);
            if (wardrobe == null)
                return NotFound();
            var res = await _wardrobeService.GetWardrobeOutfits(wardrobe.Id, options.Filter);
            var paged = res.ToPagedResponse(options.Page, options.PageSize);

            var items = await _outfitHelper.ToOutfitPackage(paged);

            return Ok(paged.MapResponseOptions(items));
        }
        [HttpGet("{userId}/summary")]
        public async Task<IActionResult> GetSummary(Guid userId)
        {
            var wardrobe = await _wardrobeService.Get(userId);
            if (wardrobe == null)
                return NotFound();
            var res = await _wardrobeService.GetWadrobeSummary(wardrobe.Id);
            return Ok(res);
        }
    }
}
