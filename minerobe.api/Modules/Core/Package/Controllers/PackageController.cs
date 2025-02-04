using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Helpers;
using minerobe.api.Modules.Core.Package.Interface;
using minerobe.api.Modules.Core.Package.Model;
using minerobe.api.Modules.Core.Package.ResponseModel;
using minerobe.api.Modules.Core.Settings.Model;
using minerobe.api.Modules.Core.User.Interface;
using minerobe.api.Modules.Core.Wardrobe.Interface;

namespace minerobe.api.Modules.Core.Package.Controllers
{
    [Route("Package")]
    [Authorize]
    public class PackageController : Controller
    {
        private readonly IPackageService _packageService;
        private readonly IUserService _userService;
        private readonly IWardrobeService _wardrobeService;
        public PackageController(IPackageService packageService, IUserService userService, IWardrobeService wardrobeService)
        {
            _packageService = packageService;
            _userService = userService;
            _wardrobeService = wardrobeService;
        }
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);
            var canAccess = await _packageService.CanAccessPackage(id, user.Id);
            if (!canAccess)
                return Unauthorized();

            var package = await _packageService.GetById(id);
            if (package == null)
                return NotFound();

            var isInWardrobe = await _wardrobeService.IsPackageInWardrobe(user.WardrobeId, id);

            return Ok(package.ToResponseModel(isInWardrobe));
        }
        [HttpGet("{id}/merged/{isFlatten}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetMerged(Guid id, bool isFlatten=false)
        {
            var user = await _userService.GetFromExternalUser(User);
            var canAccess = await _packageService.CanAccessPackage(id, user.Id);
            if (!canAccess)
                return Unauthorized();

            var mergedtetxure = await _packageService.MergePackageLayers(id,isFlatten);
            return Ok(mergedtetxure.ToResponseModel(false,true,true));
        }
        [HttpPost("")]
        public async Task<IActionResult> Add([FromBody] OutfitPackageModel package)
        {
            var res = await _packageService.Add(package.ToEntity());
            return Ok(res.ToResponseModel());
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromBody] OutfitPackageModel package, Guid id)
        {
            var ent = package.ToEntity();
            ent.Id = id;

            var user = await _userService.GetFromExternalUser(User);
            var canEdit = await _packageService.CanEditPackage(id, user.Id);
            if (!canEdit)
                return Unauthorized();


            var res = await _packageService.Update(ent);
            if (res == null)
                return NotFound();

            var isInWardrobe = await _wardrobeService.IsPackageInWardrobe(user.Id, id);
            return Ok(res.ToResponseModel(isInWardrobe, false));
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);
            var canEdit = await _packageService.CanEditPackage(id, user.Id);
            if (!canEdit)
                return Unauthorized();

            var res = await _packageService.Delete(id);
            if (!res)
                return NotFound();
            return Ok(res);
        }

    }
}
