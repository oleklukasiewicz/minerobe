using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.Package.Interface;
using minerobe.api.Modules.Core.Package.Model;
using minerobe.api.Modules.Core.Package.ResponseModel;
using minerobe.api.Modules.Core.Settings.Interface;
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
        private readonly IUserSettingsService _userSettingsService;
        public PackageController(IPackageService packageService, IUserService userService, IWardrobeService wardrobeService, IUserSettingsService userSettingsService)
        {
            _packageService = packageService;
            _userService = userService;
            _wardrobeService = wardrobeService;
            _userSettingsService = userSettingsService;
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
            var primaryLayer = await _packageService.GetPrimaryLayer(id);

            return Ok(package.ToResponseModel(isInWardrobe, true, false, primaryLayer?.Id));
        }
        [HttpGet("{id}/merged/{isFlatten}/{useBaseTexture}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetMerged(Guid id, bool isFlatten = false, bool useBaseTexture = false)
        {
            var user = await _userService.GetFromExternalUser(User);
            var canAccess = await _packageService.CanAccessPackage(id, user.Id);
            if (!canAccess)
                return Unauthorized();

            OutfitLayer baseTexture = null;

            if (useBaseTexture)
            {
                var settings = await _userSettingsService.GetSettings(user.Id);
                if (settings.BaseTexture != null)
                {
                    baseTexture = settings.BaseTexture.Layers.FirstOrDefault();
                }
            }

            var mergedtetxure = await _packageService.MergePackageLayers(id, isFlatten, baseTexture);
            return Ok(mergedtetxure.ToResponseModel(false, true, true));
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
            var primaryLayer = await _packageService.GetPrimaryLayer(id);

            return Ok(res.ToResponseModel(isInWardrobe, false, false, primaryLayer?.Id));
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);
            var canEdit = await _packageService.CanEditPackage(id, user.Id);
            if (!canEdit)
                return Unauthorized();

            var res = await _packageService.Delete(id);
            await _wardrobeService.RemovePackageFromAllWadrobes(id);
            if (!res)
                return NotFound();
            return Ok(res);
        }

    }
}
