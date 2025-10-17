using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Helpers;
using minerobe.api.Helpers.Filter;
using minerobe.api.Helpers.Model;
using minerobe.api.Modules.Core.Collection.Interface;
using minerobe.api.Modules.Core.Collection.Model;
using minerobe.api.Modules.Core.Collection.ResponseModel;
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
        public CollectionController(ICollectionService service, IUserService userService, IWardrobeService wardrobeService)
        {
            _service = service;
            _userService = userService;
            _wardrobeService = wardrobeService;
        }
        [HttpPost("")]
        public async Task<IActionResult> Add([FromBody] OutfitPackageCollectionModel collection)
        {
            var result = await _service.Add(collection.ToEntity());
            if (result == null)
                return BadRequest();
            return Ok(result);
        }
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);
            var canAccess = await _service.CanAccess(id, user.Id);
            if (!canAccess)
                return Unauthorized();

            var result = await _service.GetById(id, false);
            if (result == null)
                return NotFound();

            return Ok(result.ToResponseModel());
        }
        [HttpPost("{id}/items")]
        [AllowAnonymous]
        public async Task<IActionResult> GetItems(Guid id, [FromBody] PagedModel<SimpleFilter> options)
        {
            var user = await _userService.GetFromExternalUser(User);
            var canAccess = await _service.CanAccess(id, user.Id);
            if (!canAccess)
                return Unauthorized();
            var query = _service.GetPackagesOfCollection(id);
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
            var canAccess = await _service.CanEdit(id, user.Id);
            if (!canAccess)
                return Unauthorized();

            var result = await _service.Delete(id);
            await _wardrobeService.RemoveCollectionFromAllWadrobes(id);
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
            var canEdit = await _service.CanEdit(id, user.Id);
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
            var canEdit = await _service.CanEdit(id, user.Id);
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
            var canEdit = await _service.CanEdit(id, user.Id);
            if (!canEdit)
                return Unauthorized();

            var result = await _service.RemovePackageFromCollection(id, packageId);
            if (!result)
                return NotFound();
            return Ok(result);
        }
    }
}
