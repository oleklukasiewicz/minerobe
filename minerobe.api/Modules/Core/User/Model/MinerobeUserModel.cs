using minerobe.api.Modules.Core.User.Entity;

namespace minerobe.api.Modules.Core.User.Model
{
    public class MinerobeUserModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Avatar { get; set; }
    }
    public static class MinerobeUserModelExtensions
    {
        public static MinerobeUser ToEntity(this MinerobeUserModel model)
        {
            return new MinerobeUser
            {
                Name = model.Name,
                Avatar = model.Avatar
            };
        }
    }
}
