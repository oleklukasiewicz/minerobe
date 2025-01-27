using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Modules.Core.Settings.Interface;
using minerobe.api.Modules.Core.Social.Interface;
using minerobe.api.Modules.Core.User.Interface;
using minerobe.api.Modules.Core.User.Model;
using minerobe.api.Modules.Core.User.ResponseModel;

namespace minerobe.api.Modules.Core.User.Controllers
{
    [Route("User")]
    [Authorize]
    public class UserController : Controller
    {
        private readonly IUserService _userService;
        private readonly IUserSettingsService _userSettingsService;
        private readonly ISocialService _socialService;
        public UserController(IUserService userService, IUserSettingsService userSettingsService, ISocialService socialService)
        {
            _userService = userService;
            _userSettingsService = userSettingsService;
            _socialService = socialService;
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var user = await _userService.GetById(id);
            if (user == null)
                return NotFound();
            return Ok(user);
        }
        [HttpGet("{name}/name")]
        public async Task<IActionResult> Get(string name)
        {
            var user = await _userService.GetByName(name);
            if (user == null)
                return NotFound();
            return Ok(user.ToResponseModel());
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Put([FromBody] MinerobeUserModel user, Guid id)
        {
            var ent = user.ToEntity();
            ent.Id = id;

            var updated = await _userService.Update(ent);
            if (updated == null)
                return NotFound();
            return Ok(updated.ToResponseModel());
        }
        [HttpGet("Login")]
        public async Task<IActionResult> Login()
        {
            var user = await _userService.Login(User);
            if (user == null)
                return NotFound();
            return Ok(user.ToResponseModel());
        }
        [HttpGet("{id}/profile")]
        public async Task<IActionResult> GetProfile(Guid id)
        {
            var user = await _userService.GetById(id);
            var settings = await _userSettingsService.GetSettings(id);
            var social = await _socialService.GetUserSummary(id);
            if (user == null)
                return NotFound();
            return Ok(user.ToProfileResponseModel(settings, social));
        }

    }
}
