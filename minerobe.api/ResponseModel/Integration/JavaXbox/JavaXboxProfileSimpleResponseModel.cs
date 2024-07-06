namespace minerobe.api.ResponseModel.Integration.JavaXbox
{
    public class JavaXboxProfileSimpleResponseModel
    {
        public string UserId { get; set; }
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
                UserId = entity.UserId,
                Username = entity.Username,
                Capes = entity.Capes,
                CurrentCapeId = entity.CurrentCapeId,
            };
        }
    }
}
