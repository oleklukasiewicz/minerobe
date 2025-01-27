using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Modules.Core.Package.Model;
using minerobe.api.Modules.Core.Settings.Entity;
using minerobe.api.Modules.Core.Settings.Interface;
using minerobe.api.Modules.Core.Settings.Model;
using minerobe.api.Modules.Core.Settings.ResponseModel;
using minerobe.api.Modules.Core.User.Interface;
using minerobe.api.Modules.Integration.Minecraft.Interface;

namespace minerobe.api.Modules.Core.Settings.Controllers
{

    [Route("UserSettings")]
    [Authorize]
    public class UserSettingsController : Controller
    {
        private readonly IUserSettingsService _userSettingsService;
        private readonly IUserService _userService;
        private readonly IJavaXboxAuthService _javaXboxAuthService;
        public UserSettingsController(IUserSettingsService userSettingsService, IUserService userService, IJavaXboxAuthService javaXboxAuthService)
        {
            _userSettingsService = userSettingsService;
            _userService = userService;
            _javaXboxAuthService = javaXboxAuthService;
        }
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var user = await _userService.GetFromExternalUser(User);

            var settings = await _userSettingsService.GetSettings(user.Id);
            if (settings == null)
                return NotFound();

            return Ok(settings.ToResponseModel());
        }
        [HttpGet("Simple")]
        public async Task<IActionResult> GetSimple()
        {
            var user = await _userService.GetFromExternalUser(User);

            var settings = await _userSettingsService.GetSettings(user.Id);
            if (settings == null)
                return NotFound();

            return Ok(settings.ToSimpleResponseModel());
        }
        [HttpPost("BaseTexture")]
        public async Task<IActionResult> UpdateBaseTexture([FromBody] OutfitPackageModel baseTexture)
        {
            var user = await _userService.GetFromExternalUser(User);

            var settings = await _userSettingsService.UpdateBaseTexture(user.Id, baseTexture.ToEntity());
            if (settings == null)
                return NotFound();

            return Ok(settings.ToSimpleResponseModel());
        }
        [HttpPost("CurrentTexture/{id}")]
        public async Task<IActionResult> UpdateCurrentTexture(Guid id, [FromBody] TextureRenderConfigModel currentTexture)
        {
            var user = await _userService.GetFromExternalUser(User);

            var entity = currentTexture.ToEntity();
            var settings = await _userSettingsService.UpdateCurrentTexture(user.Id, id, entity);

            //minecraft services integrations
            if (settings.ContainsIntegration("minecraft"))
            {
                await _javaXboxAuthService.SetUserSkin(user.Id, entity.Model);
                if (currentTexture.CapeId != null)
                    await _javaXboxAuthService.SetUserCape(user.Id, currentTexture.CapeId.Value);
                else
                    await _javaXboxAuthService.HideUserCape(user.Id);
            }
            if (settings == null)
                return NotFound();

            return Ok(settings.ToSimpleResponseModel());
        }
    }
}
