using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Model;
using minerobe.api.ResponseModel.Collection;
using minerobe.api.Services.Interface;

namespace minerobe.api.Controllers
{
    [Route("Collections")]
    [Authorize]
    public class CollectionController : Controller
    {
        private readonly ICollectionService _service;
        private readonly IUserService _userService;
        public CollectionController(ICollectionService service, IUserService userService)
        {
            _service = service;
            _userService = userService;
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

            var result = await _service.GetById(id);
            if (result == null)
                return NotFound();

            return Ok(result.ToResponseModel());
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);
            var canAccess = await _service.CanEdit(id, user.Id);
            if (!canAccess)
                return Unauthorized();

            var result = await _service.Delete(id);
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
        [HttpPost("add/{id}/{packageId}")]
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
        [HttpDelete("remove/{id}/{packageId}")]
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
