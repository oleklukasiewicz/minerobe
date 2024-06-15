using minerobe.api.Entity;
using minerobe.api.Entity.Settings;
using minerobe.api.Entity.User;
using minerobe.api.Helpers;

namespace minerobe.api.ResponseModel.User
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
