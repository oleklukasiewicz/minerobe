using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Helpers;
using minerobe.api.Helpers.Model;
using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.Package.Interface;
using minerobe.api.Modules.Core.Package.Model;
using minerobe.api.Modules.Core.Package.ResponseModel;
using minerobe.api.Modules.Core.Permits.Interface;
using minerobe.api.Modules.Core.Settings.Interface;
using minerobe.api.Modules.Core.Settings.Model;
using minerobe.api.Modules.Core.Social.Interface;
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
        private readonly IPermitsService _permitsService;
        private readonly ISocialService _socialService;
        public PackageController(IPackageService packageService, IUserService userService, IWardrobeService wardrobeService, IUserSettingsService userSettingsService, IPermitsService permitsService, ISocialService socialService)
        {
            _packageService = packageService;
            _userService = userService;
            _wardrobeService = wardrobeService;
            _userSettingsService = userSettingsService;
            _permitsService = permitsService;
            _socialService = socialService;
        }
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(Guid id)
        {
            var user = await _userService.GetFromExternalUser(User);
            var canAccess = await _permitsService.CanView(user.Id, id, EntityType.OUTFIT_PACKAGE);
            if (!canAccess)
                return Unauthorized();

            var package = await _packageService.GetById(id);
            if (package == null)
                return NotFound();

            package.Social = await _socialService.GetById(package.SocialDataId);
            package.Publisher = await _userService.GetById(package.PublisherId);

            var isInWardrobe = await _wardrobeService.IsPackageInWardrobe(user.WardrobeId, id);
            var primaryLayer = await _packageService.GetPrimaryLayer(id);

            return Ok(package.ToResponseModel(isInWardrobe, true, false, primaryLayer?.Id));
        }
        [HttpGet("{id}/merged/{isFlatten}/{useBaseTexture}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetMerged(Guid id, bool isFlatten = false, bool useBaseTexture = false)
        {
            var user = await _userService.GetFromExternalUser(User);
            var canAccess = await _permitsService.CanView(user.Id, id, EntityType.OUTFIT_PACKAGE);
            if (!canAccess)
                return Unauthorized();

            OutfitLayer baseTexture = null;

            if (useBaseTexture && user != null)
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
            var entity = package.ToEntity();
            entity.SocialDataId = await _socialService.Add();

            var res = await _packageService.Add(entity);

            return Ok(res.ToResponseModel());
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromBody] OutfitPackageModel package, Guid id)
        {
            var ent = package.ToEntity();
            ent.Id = id;

            var user = await _userService.GetFromExternalUser(User);
            var canEdit = await _permitsService.CanEdit(user.Id, id, EntityType.OUTFIT_PACKAGE);
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
            var canEdit = await _permitsService.CanEdit(user.Id, id, EntityType.OUTFIT_PACKAGE);
            if (!canEdit)
                return Unauthorized();

            var res = await _packageService.Delete(id);
            await _wardrobeService.RemovePackageFromExternalWardrobes(id);
            if (!res)
                return NotFound();
            return Ok(res);
        }

        [HttpPost("downloadTexture")]
        [AllowAnonymous]
        public async Task<IActionResult> DownloadTexture([FromBody] OutfitPackageRenderConfigModel config)
        {
            var user = await _userService.GetFromExternalUser(User);
            var canAccess = await _permitsService.CanView(user.Id, config.PackageId, EntityType.OUTFIT_PACKAGE);
            if (!canAccess)
                return Unauthorized();

            OutfitLayer baseTexture = null;

            if (config.UseBaseTexture && user != null)
            {
                var settings = await _userSettingsService.GetSettings(user.Id);
                if (settings.BaseTexture != null)
                {
                    baseTexture = settings.BaseTexture.Layers.FirstOrDefault();
                }
            }
            var mergedtetxure = await _packageService.MergePackageLayers(config.PackageId, config.IsFlatten, baseTexture, config.LayerId);
            var mergedLayer = mergedtetxure.Layers[0];


            if (mergedtetxure.PublisherId != user?.Id)
                await _socialService.Download(mergedtetxure.SocialDataId);

            var social = await _socialService.GetById(mergedtetxure.SocialDataId);
            var texture = Enum.Parse<ModelType>(config.Model.ToFirstCapitalLetter()) == ModelType.Steve ? mergedLayer.Steve : mergedLayer.Alex;
            texture.FileName = mergedtetxure.Name.Trim();
            return Ok(
                new
                {
                    Texture = texture.ToResponseModel(),
                    Downloads = social.Downloads
                });
        }
    }
}