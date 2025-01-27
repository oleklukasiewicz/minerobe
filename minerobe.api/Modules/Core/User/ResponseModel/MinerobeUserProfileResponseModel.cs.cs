using minerobe.api.Modules.Core.Settings.Entity;
using minerobe.api.Modules.Core.Settings.ResponseModel;
using minerobe.api.Modules.Core.Social.Entity;
using minerobe.api.Modules.Core.User.Entity;
using minerobe.api.Modules.Core.User.ResponseModel;

namespace minerobe.api.Modules.Core.User.ResponseModel
{
    public class MinerobeUserProfileResponseModel
    {
        public MinerobeUserResponseModel User { get; set; }
        public UserSettingsResponseModel Settings { get; set; }
        public SocialData Social { get; set; }
    }
    public static class MinerobeUserProfileResponseModelExtensions
    {
        public static MinerobeUserProfileResponseModel ToProfileResponseModel(this MinerobeUser entity, UserSettings settings, SocialData social)
        {
            return new MinerobeUserProfileResponseModel
            {
                User = entity.ToResponseModel(),
                Settings = settings.ToResponseModel(),
                Social = social
            };
        }
    }
}
