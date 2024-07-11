using minerobe.api.Entity.Integration;

namespace minerobe.api.ResponseModel.Integration.JavaXbox
{
    public class JavaXboxProfileSimpleResponseModel
    {
        public Guid AccountId { get; set; }
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
                AccountId=entity.AccountId,
                Username = entity.Username,
                Capes = entity.Capes,
                CurrentCapeId = entity.CurrentCapeId,
            };
        }
    }
}
