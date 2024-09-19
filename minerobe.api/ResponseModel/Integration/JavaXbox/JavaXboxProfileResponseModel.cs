using minerobe.api.Helpers.Integration;

namespace minerobe.api.ResponseModel.Integration.JavaXbox
{
    public class JavaXboxProfileResponseModel
    {
        public Guid Id { get; set; }
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
                Id = entity.Id,
                Username = entity.Profile.Username,
                Skin = entity.Profile.Skins?.Where(x => x.Id == entity.Profile.CurrentSkinId).FirstOrDefault(),
                Capes = entity.Profile.Capes,
                CurrentCapeId = entity.Profile?.CurrentCapeId,
            };
        }
    }
}
