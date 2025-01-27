using minerobe.api.Modules.Core.User.Entity;

namespace minerobe.api.Modules.Core.User.ResponseModel
{
    public class MinerobeUserResponseModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Avatar { get; set; }
        public Guid WardrobeId { get; set; }
    }
    public static class MinerobeUserResponseModelExtensions
    {
        public static MinerobeUserResponseModel ToResponseModel(this MinerobeUser entity)
        {
            return new MinerobeUserResponseModel
            {
                Id = entity.Id,
                Name = entity.Name,
                Avatar = entity.Avatar,
                WardrobeId = entity.WardrobeId
            };
        }
    }
}
