using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Modules.Core.Package.Model;
using minerobe.api.Modules.Core.Package.ResponseModel;
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
        private readonly IMinecraftService _javaXboxAuthService;
        public UserSettingsController(IUserSettingsService userSettingsService, IUserService userService, IMinecraftService javaXboxAuthService)
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
        [HttpGet("Integrations")]
        public async Task<IActionResult> GetIntegrations()
        {
            var user = await _userService.GetFromExternalUser(User);

            var settings = await _userSettingsService.GetSettings(user.Id);
            if (settings == null)
                return NotFound();

            return Ok(new { integrations = settings.Integrations.Select(x=>x.Type) });
        }

        [HttpPost("BaseTexture")]
        public async Task<IActionResult> UpdateBaseTexture([FromBody] OutfitPackageModel baseTexture)
        {
            var user = await _userService.GetFromExternalUser(User);

            var settings = await _userSettingsService.UpdateBaseTexture(user.Id, baseTexture.ToEntity());
            if (settings == null)
                return NotFound();

            return Ok(settings.BaseTexture.ToResponseModel());
        }
        [HttpPost("CurrentSkin")]
        public async Task<IActionResult> UpdateCurrentTexture([FromBody] OutfitPackageConfigModel currentTexture)
        {
            var user = await _userService.GetFromExternalUser(User);

            var settings = await _userSettingsService.UpdateCurrentTexture(user.Id, currentTexture);
            var entity = currentTexture.ToEntity();
            //minecraft services integrations
            if (settings.ContainsIntegration("minecraft"))
            {
                await _javaXboxAuthService.SetUserSkin(user.Id, entity);
                if (currentTexture.CapeId != null)
                    await _javaXboxAuthService.SetUserCape(user.Id, currentTexture.CapeId.Value);
                else
                    await _javaXboxAuthService.HideUserCape(user.Id);
            }
            if (settings == null)
                return NotFound();

            return Ok(settings.CurrentTexture.ToResponseModel());
        }
    }
}
