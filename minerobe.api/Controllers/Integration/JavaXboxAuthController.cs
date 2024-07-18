using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.ResponseModel.Integration.JavaXbox;
using minerobe.api.Services.Interface;

namespace minerobe.api.Controllers.Integration
{
    [Route("JavaXboxAuth")]
    public class JavaXboxAuthController : Controller
    {
        private readonly IUserService _userService;
        private readonly IJavaXboxAuthService _javaXboxAuthService;
        public JavaXboxAuthController(IUserService userService, IJavaXboxAuthService javaXboxAuthService)
        {
            _userService = userService;
            _javaXboxAuthService = javaXboxAuthService;
        }

        [HttpGet("Link")]
        public async Task<IActionResult> Auth()
        {
            var user = await _userService.GetFromToken(User);

            var profile = await _javaXboxAuthService.LinkAccount(user);
            return Ok(profile);
        }
        [HttpGet("Profile")]
        public async Task<IActionResult> GetProfile()
        {
            var user = await _userService.GetFromToken(User);

            var profile = await _javaXboxAuthService.GetProfile(user);
            return Ok(profile.ToSimpleResponseModel());
        }
        [HttpGet("Unlink")]
        public async Task<IActionResult> Unlink()
        {
            var user = await _userService.GetFromToken(User);

            var result = await _javaXboxAuthService.UnLinkAccount(user);
            return Ok(result);
        }
        [HttpGet("SkinTexture/{id}"), AllowAnonymous]
        public async Task<IActionResult> GetSkinTexture(Guid id)
        {
            var skin = await _javaXboxAuthService.GetUserCurrentSkin(id);
            byte[] skinBytes = Convert.FromBase64String(skin.Substring(skin.LastIndexOf(',') + 1));
            return File(skinBytes, "image/png");

        }
    }
}
