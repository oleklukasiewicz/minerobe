using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using minerobe.api.Helpers;
using minerobe.api.Helpers.Filter;
using minerobe.api.Helpers.Model;
using minerobe.api.Modules.Core.Collection.Interface;
using minerobe.api.Modules.Core.Collection.Model;
using minerobe.api.Modules.Core.Collection.ResponseModel;
using minerobe.api.Modules.Core.PackageAgregation.Interface;
using minerobe.api.Modules.Core.Permits.Interface;
using minerobe.api.Modules.Core.Social.Interface;
using minerobe.api.Modules.Core.User.Interface;
using minerobe.api.Modules.Core.Wardrobe.Interface;

namespace minerobe.api.Modules.Core.Collection.Controllers
{
    [Route("Collections")]
    [Authorize]
    public class CollectionController : Controller
    {
        private readonly ICollectionService _service;
        private readonly IUserService _userService;
        private readonly IWardrobeService _wardrobeService;
        private readonly IPermitsService _permitsService;
        private readonly ISocialService _socialService;
        private readonly IOutfitPackageAgregationService _outfitPackageAgregationService;
        public CollectionController(ICollectionService service, IUserService userService, IWardrobeService wardrobeService, IPermitsService permitsService, ISocialService socialService, IOutfitPackageAgregationService outfitPackageAgregationService)
        {
            _service = service;
            _userService = userService;
            _wardrobeService = wardrobeService;
            _permitsService = permitsService;
            _socialService = socialService;
            _outfitPackageAgregationService = outfitPackageAgregationService;
        }
        [HttpPost("")]
        public async Task<IActionResult> Add([FromBody] OutfitPackageCollectionModel collection)
        {
            var entity = collection.ToEntity();
            entity.SocialDataId = await _socialService.Add();
            var result = await _service.Add(entity);
            if (result == null)
                return BadRequest();
            return Ok(result);
        }
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);
            var canAccess = await _permitsService.CanView(user.Id, id, EntityType.OUTFIT_COLLECTION);
            if (!canAccess)
                return Unauthorized();

            var result = await _service.GetById(id);
            if (result == null)
                return NotFound();

            var packageIds = result.Items.Select(x => x.Id).AsQueryable();

            result.Items = await _outfitPackageAgregationService.FromIdList(packageIds).ToListAsync();

            result.Social = await _socialService.GetById(result.SocialDataId);
            result.Publisher = await _userService.GetById(result.PublisherId);

            return Ok(result.ToResponseModel());
        }
        [HttpPost("{id}/items")]
        [AllowAnonymous]
        public async Task<IActionResult> GetItems(Guid id, [FromBody] PagedModel<SimpleFilter> options)
        {
            var user = await _userService.GetFromExternalUser(User);
            var canAccess = await _permitsService.CanView(user.Id, id, EntityType.OUTFIT_COLLECTION);
            if (!canAccess)
                return Unauthorized();
            var collection = await _service.GetById(id);

            var packageIds = collection.Items.Select(x => x.Id).AsQueryable();

            var query = _outfitPackageAgregationService.FromIdList(packageIds);

            var result = query.ToPagedResponse(options);
            if (result == null)
                return NotFound();

            var items = result.ToOutfitPackage();

            return Ok(result.MapResponseOptions(items));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);
            var canEdit = await _permitsService.CanEdit(user.Id, id, EntityType.OUTFIT_COLLECTION);
            if (!canEdit)
                return Unauthorized();

            var result = await _service.Delete(id);
            await _wardrobeService.RemoveCollectionFromExternalWardrobes(id);
            if (!result)
                return NotFound();

            return Ok(result);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromBody] OutfitPackageCollectionModel collection, Guid id)
        {
            var ent = collection.ToEntity();
            ent.Id = id;

            var user = await _userService.GetFromExternalUser(User);
            var canEdit = await _permitsService.CanEdit(user.Id, id, EntityType.OUTFIT_COLLECTION);
            if (!canEdit)
                return Unauthorized();

            var result = await _service.Update(ent);
            if (result == null)
                return NotFound();
            return Ok(result.ToResponseModel());
        }
        [HttpPost("{id}/add/{packageId}")]
        public async Task<IActionResult> AddPackage(Guid id, Guid packageId)
        {
            var user = await _userService.GetFromExternalUser(User);
            var canEdit = await _permitsService.CanEdit(user.Id, id, EntityType.OUTFIT_COLLECTION);
            if (!canEdit)
                return Unauthorized();

            var result = await _service.AddPackageToCollection(id, packageId);
            if (!result)
                return BadRequest();
            return Ok(result);
        }
        [HttpDelete("{id}/remove/{packageId}")]
        public async Task<IActionResult> RemovePackage(Guid id, Guid packageId)
        {
            var user = await _userService.GetFromExternalUser(User);
            var canEdit = await _permitsService.CanEdit(user.Id, id, EntityType.OUTFIT_COLLECTION);
            if (!canEdit)
                return Unauthorized();

            var result = await _service.RemovePackageFromCollection(id, packageId);
            if (!result)
                return NotFound();
            return Ok(result);
        }
    }
}
