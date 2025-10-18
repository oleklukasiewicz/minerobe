using Microsoft.AspNetCore.Mvc;
using minerobe.api.Modules.Core.User.Interface;
using minerobe.api.Modules.Integration.Minecraft.Interface;
using minerobe.api.Modules.Integration.Minecraft.ResponseModel;

namespace minerobe.api.Modules.Integration.Minecraft.Controllers
{
    [Route("McIntegration")]
    public class MinecraftController : Controller
    {
        private readonly IUserService _userService;
        private readonly IMinecraftService _javaXboxAuthService;
        public MinecraftController(IUserService userService, IMinecraftService javaXboxAuthService)
        {
            _userService = userService;
            _javaXboxAuthService = javaXboxAuthService;
        }

        [HttpGet("Link")]
        public async Task<IActionResult> Auth()
        {
            var user = await _userService.GetFromToken(User);

            var profile = await _javaXboxAuthService.LinkAccount(user);
            return Ok(profile.ToResponseModel());
        }
        [HttpGet("Profile")]
        public async Task<IActionResult> GetProfile([FromQuery] bool keepFresh)
        {
            var user = await _userService.GetFromToken(User);

            var profile = await _javaXboxAuthService.GetProfile(user, keepFresh);
            return Ok(profile.ToResponseModel());
        }
        [HttpGet("Skin")]
        public async Task<IActionResult> GetSkin([FromQuery] bool keepFresh)
        {
            var user = await _userService.GetFromToken(User);

            var profile = await _javaXboxAuthService.GetProfile(user, keepFresh);
            var skin = profile?.Profile?.Skins?.FirstOrDefault(x => x.Id == profile?.Profile?.CurrentSkinId);
            if (skin == null)
                return NotFound();
            return Ok(skin);
        }
        [HttpGet("RefreshProfile")]
        public async Task<IActionResult> RefreshData()
        {
            var user = await _userService.GetFromToken(User);
            var profile = await _javaXboxAuthService.GetProfile(user, true);
            return Ok(true);
        }
        [HttpGet("Unlink")]
        public async Task<IActionResult> Unlink()
        {
            var user = await _userService.GetFromToken(User);

            var result = await _javaXboxAuthService.UnLinkAccount(user);
            return Ok(result);
        }
    }
}
