using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Modules.Core.Package.Interface;
using minerobe.api.Modules.Core.Social.Interface;
using minerobe.api.Modules.Core.User.Interface;
using minerobe.api.Modules.Core.Wardrobe.Interface;

namespace minerobe.api.Modules.Core.Social.Controllers
{
    [Route("Social")]
    [Authorize]
    public class SocialController : Controller
    {
        private readonly ISocialService _socialService;
        private readonly IUserService _userService;
        private readonly IWardrobeService _wardrobeService;
        private readonly IPackageService _packageService;
        public SocialController(ISocialService socialService, IUserService userService, IWardrobeService wardrobeService, IPackageService packageService)
        {
            _socialService = socialService;
            _userService = userService;
            _wardrobeService = wardrobeService;
            _packageService = packageService;
        }
        [HttpPost("Share/{id}")]
        public async Task<IActionResult> Share(Guid id)
        {
            var canEdit = await _socialService.CanEditSocial(id, (await _userService.GetFromExternalUser(User)).Id);
            if (!canEdit)
                return Unauthorized();
            var res = await _socialService.Share(id);
            if (res == null)
                return NotFound();
            return Ok(res);
        }
        [HttpPost("Unshare/{id}")]
        public async Task<IActionResult> Unshare(Guid id)
        {
            var res = await _socialService.Unshare(id);
            var canEdit = await _socialService.CanEditSocial(id, (await _userService.GetFromExternalUser(User)).Id);
            if (!canEdit)
                return Unauthorized();
            if (res == null)
                return NotFound();

            var packageId = await _packageService.GetIdBySocialId(id);
            await _wardrobeService.RemovePackageFromAllWadrobes(packageId);
            return Ok(res);
        }
        [HttpPost("Download/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Download(Guid id)
        {
            var canEdit = await _socialService.CanAccessSocial(id, (await _userService.GetFromExternalUser(User)).Id);
            if (!canEdit)
                return Unauthorized();

            var res = await _socialService.Download(id);
            if (res == null)
                return NotFound();
            return Ok(res);
        }
        [HttpGet("User/{userId}")]
        public async Task<IActionResult> GetUserSummary(Guid userId)
        {
            var res = await _socialService.GetUserSummary(userId);
            if (res == null)
                return NotFound();
            return Ok(res);
        }
    }
}
