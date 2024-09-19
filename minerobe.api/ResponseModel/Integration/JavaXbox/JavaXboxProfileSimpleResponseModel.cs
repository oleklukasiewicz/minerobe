using minerobe.api.Helpers.Integration;

namespace minerobe.api.ResponseModel.Integration.JavaXbox
{
    public class JavaXboxProfileSimpleResponseModel
    {
        public Guid Id { get; set; }
        public string Username { get; set; }
        public List<JavaXboxCape> Capes { get; set; }
        public Guid? CurrentCapeId { get; set; }
    }
    public static class JavaXboxProfileSimpleResponseModelExtensions
    {
        public static JavaXboxProfileSimpleResponseModel ToSimpleResponseModel(this JavaXboxProfile entity)
        {
            return new JavaXboxProfileSimpleResponseModel
            {
                Id = entity.Id,
                Username = entity.Profile.Username,
                Capes = entity.Profile.Capes,
                CurrentCapeId = entity.Profile.CurrentCapeId,
            };
        }
    }
}
