using minerobe.api.Modules.Core.User.Entity;

namespace minerobe.api.Modules.Core.User.ResponseModel
{
    public class MinerobePackageUserResponseModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
    }
    public static class MinerobePackageUserResponseModelExtensions
    {
        public static MinerobePackageUserResponseModel ToPackageResponseModel(this MinerobeUser entity)
        {
            if (entity == null)
                return new MinerobePackageUserResponseModel();
            return new MinerobePackageUserResponseModel
            {
                Id = entity.Id,
                Name = entity.Name
            };
        }
    }
}
