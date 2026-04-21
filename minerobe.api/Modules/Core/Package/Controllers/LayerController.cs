using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Helpers.Model;
using minerobe.api.Modules.Core.Package.Interface;
using minerobe.api.Modules.Core.Package.Model;
using minerobe.api.Modules.Core.Package.ResponseModel;
using minerobe.api.Modules.Core.Permits.Interface;
using minerobe.api.Modules.Core.User.Interface;

namespace minerobe.api.Modules.Core.Package.Controllers
{
    [Route("Layers")]
    [Authorize]
    public class LayerController : Controller
    {
        private readonly IPackageService _packageService;
        private readonly IUserService _userService;
        private readonly IPermitsService _permitsService;
        public LayerController(IPackageService packageService, IUserService userService, IPermitsService permitsService)
        {
            _packageService = packageService;
            _userService = userService;
            _permitsService = permitsService;
        }
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);

            var layer = await _packageService.GetLayerById(id);
            if (layer == null)
                return NotFound();


            var canAccess = await _permitsService.CanView(user.Id, layer.SourcePackageId.Value, EntityType.OUTFIT_PACKAGE);
            if (!canAccess)
                return Unauthorized();

            return Ok(layer.ToResponseModel(layer.SourcePackageId.Value, true));
        }
        [HttpPost("")]
        public async Task<IActionResult> Add([FromBody] OutfitLayerModel layer)
        {
            if (layer.SourcePackageId == null)
                return BadRequest();

            var canEdit = await _permitsService.CanEdit((await _userService.GetFromExternalUser(User)).Id, layer.SourcePackageId.Value, EntityType.OUTFIT_PACKAGE);
            if (!canEdit)
                return Unauthorized();

            var res = await _packageService.AddLayer(layer.ToEntity(), layer.SourcePackageId.Value);
            return Ok(res.ToResponseModel(layer.SourcePackageId.Value, true));
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromBody] OutfitLayerModel layer, Guid id)
        {

            var layerInDb = await _packageService.GetLayerById(id);

            var canEdit = await _permitsService.CanEdit((await _userService.GetFromExternalUser(User)).Id, layerInDb.SourcePackageId.Value, EntityType.OUTFIT_PACKAGE);
            if (!canEdit)
                return Unauthorized();

            var res = await _packageService.UpdateLayer(layer.ToEntity());
            if (res == null)
                return NotFound();

            return Ok(res.ToResponseModel(layerInDb.SourcePackageId.Value, true));
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var layer = await _packageService.GetLayerById(id);
            if (layer == null)
                return NotFound();

            var canEdit = await _permitsService.CanEdit((await _userService.GetFromExternalUser(User)).Id, layer.SourcePackageId.Value, EntityType.OUTFIT_PACKAGE);
            if (!canEdit)
                return Unauthorized();

            var res = await _packageService.DeleteLayer(id);
            if (res == false)
                return NotFound();

            return Ok(res);
        }
        [HttpPost("{packageId}/add/{id}")]
        public async Task<IActionResult> AddLayerToPackage(Guid id, Guid packageId)
        {
            var canEdit = await _permitsService.CanEdit((await _userService.GetFromExternalUser(User)).Id, packageId, EntityType.OUTFIT_PACKAGE);
            if (!canEdit)
                return Unauthorized();

            var res = await _packageService.AddLayerToPackage(id, packageId);
            if (res == null)
                return NotFound();
            return Ok(res.ToResponseModel(packageId, true));
        }
        [HttpDelete("{packageId}/remove/{id}")]
        public async Task<IActionResult> RemoveLayerFromPackage(Guid id, Guid packageId)
        {
            var canEdit = await _permitsService.CanEdit((await _userService.GetFromExternalUser(User)).Id, packageId, EntityType.OUTFIT_PACKAGE);
            if (!canEdit)
                return Unauthorized();

            var res = await _packageService.RemoveLayerFromPackage(id, packageId);
            if (!res)
                return NotFound();
            return Ok(res);
        }

        [HttpPost("Order/{id}")]
        public async Task<IActionResult> UpdateLayerOrder(Guid id, [FromBody] List<Guid> layersInOrder)
        {
            var canEdit = await _permitsService.CanEdit((await _userService.GetFromExternalUser(User)).Id, id, EntityType.OUTFIT_PACKAGE);
            if (!canEdit)
                return Unauthorized();

            var res = await _packageService.UpdateLayerOrder(id, layersInOrder);
            if (!res)
                return NotFound();
            return Ok(res);
        }
        [HttpPost("Primary/{packageId}/{layerId}")]
        public async Task<IActionResult> UpdatePrimaryLayer(Guid packageId, Guid layerId)
        {
            var canEdit = await _permitsService.CanEdit((await _userService.GetFromExternalUser(User)).Id, packageId, EntityType.OUTFIT_PACKAGE);
            if (!canEdit)
                return Unauthorized();
            var res = await _packageService.UpdatePrimaryLayer(packageId, layerId);
            if (!res)
                return NotFound();
            return Ok(res);
        }
        [HttpDelete("Primary/{packageId}")]
        public async Task<IActionResult> RemovePrimaryLayer(Guid packageId)
        {
            var canEdit = await _permitsService.CanEdit((await _userService.GetFromExternalUser(User)).Id, packageId, EntityType.OUTFIT_PACKAGE);
            if (!canEdit)
                return Unauthorized();
            var res = await _packageService.RemovePrimaryLayer(packageId);
            if (!res) return NotFound();
            return Ok(res);
        }

    }
}
