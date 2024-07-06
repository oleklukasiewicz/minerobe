namespace minerobe.api.ResponseModel.Integration.JavaXbox
{
    public class JavaXboxProfileResponseModel
    {
        public string UserId { get; set; }
        public string Username { get; set; }
        public JavaXboxSkin Skin { get; set; }
        public List<JavaXboxCape> Capes { get; set; }
        public Guid? CurrentCapeId { get; set; }
    }
    public static class JavaXboxProfileResponseModelExtensions
    {
        public static JavaXboxProfileResponseModel ToResponseModel(this JavaXboxProfile entity)
        {
            return new JavaXboxProfileResponseModel
            {
                UserId = entity.UserId,
                Username = entity.Username,
                Skin = entity.Skins.Where(x=>x.Id==entity.CurrentSkinId).FirstOrDefault(),
                Capes = entity.Capes,
                CurrentCapeId = entity.CurrentCapeId,
            };
        }
    }
}
