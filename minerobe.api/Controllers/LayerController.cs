using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Model.Package;
using minerobe.api.ResponseModel.Package;
using minerobe.api.Services.Interface;

namespace minerobe.api.Controllers
{
    [Route("Layers")]
    [Authorize]
    public class LayerController : Controller
    {
        private readonly IPackageService _packageService;
        private readonly IUserService _userService;
        public LayerController(IPackageService packageService, IUserService userService)
        {
            _packageService = packageService;
            _userService = userService;
        }
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);

            var layer = await _packageService.GetLayerById(id);
            if (layer == null)
                return NotFound();


            var canAccess = await _packageService.CanAccessPackage(layer.SourcePackageId.Value, user.Id);
            if (canAccess == false)
                return Unauthorized();

            return Ok(layer.ToResponseModel(layer.SourcePackageId.Value, false));
        }
        [HttpGet("{id}/snapshot")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSnapshot(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);

            var layer = await _packageService.GetLayerById(id);
            if (layer == null)
                return NotFound();


            var canAccess = await _packageService.CanAccessPackage(layer.SourcePackageId.Value, user.Id);
            if (canAccess == false)
                return Unauthorized();

            return Ok(layer.ToResponseModel(layer.SourcePackageId.Value, true));
        }
        [HttpPost("")]
        public async Task<IActionResult> Add([FromBody] OutfitLayerModel layer)
        {
            if (layer.SourcePackageId == null)
                return BadRequest();

            var canEdit = await _packageService.CanEditPackage(layer.SourcePackageId.Value, (await _userService.GetFromExternalUser(User)).Id);
            if (canEdit == false)
                return Unauthorized();

            var res = await _packageService.AddLayer(layer.ToEntity(), layer.SourcePackageId.Value);
            return Ok(res.ToResponseModel(layer.SourcePackageId.Value, false));
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromBody] OutfitLayerModel layer, Guid id)
        {

            var layerInDb = await _packageService.GetLayerById(id);

            var canEdit = await _packageService.CanEditPackage(layerInDb.SourcePackageId.Value, (await _userService.GetFromExternalUser(User)).Id);
            if (canEdit == false)
                return Unauthorized();

            var res = await _packageService.UpdateLayer(layer.ToEntity());
            if (res == null)
                return NotFound();

            return Ok(res.ToResponseModel(layerInDb.SourcePackageId.Value, false));
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var layer = await _packageService.GetLayerById(id);
            if (layer == null)
                return NotFound();

            var canEdit = await _packageService.CanEditPackage(layer.SourcePackageId.Value, (await _userService.GetFromExternalUser(User)).Id);
            if (canEdit == false)
                return Unauthorized();

            var res = await _packageService.DeleteLayer(id);
            if (res == false)
                return NotFound();

            return Ok(res);
        }
        [HttpPost("add/{id}/{packageId}")]
        public async Task<IActionResult> AddLayerToPackage(Guid id, Guid packageId)
        {
            var canEdit = await _packageService.CanEditPackage(packageId, (await _userService.GetFromExternalUser(User)).Id);
            if (canEdit == false)
                return Unauthorized();

            var res = await _packageService.AddLayerToPackage(id, packageId);
            if (res == null)
                return NotFound();
            return Ok(res.ToResponseModel(packageId, false));
        }
        [HttpDelete("remove/{id}/{packageId}")]
        public async Task<IActionResult> RemoveLayerFromPackage(Guid id, Guid packageId)
        {
            var canEdit = await _packageService.CanEditPackage(packageId, (await _userService.GetFromExternalUser(User)).Id);
            if (canEdit == false)
                return Unauthorized();

            var res = await _packageService.RemoveLayerFromPackage(id, packageId);
            if (res == false)
                return NotFound();
            return Ok(res);
        }

        [HttpPost("Order/{id}")]
        public async Task<IActionResult> UpdateLayerOrder(Guid id, [FromBody] List<Guid> layersInOrder)
        {
            var canEdit = await _packageService.CanEditPackage(id, (await _userService.GetFromExternalUser(User)).Id);
            if (canEdit == false)
                return Unauthorized();

            var res = await _packageService.UpdateLayerOrder(id, layersInOrder);
            if (res == false)
                return NotFound();
            return Ok(res);
        }
        [HttpPost("Merged")]
        public async Task<IActionResult> SetMergedLayer([FromBody] OutfitLayerModel layer)
        {
            var canEdit = await _packageService.CanEditPackage(layer.SourcePackageId.Value, (await _userService.GetFromExternalUser(User)).Id);
            if (canEdit == false)
                return Unauthorized();

            var res = await _packageService.SetMergedLayer(layer.ToEntity());
            return Ok(res.ToResponseModel(layer.SourcePackageId.Value));
        }
    }
}
