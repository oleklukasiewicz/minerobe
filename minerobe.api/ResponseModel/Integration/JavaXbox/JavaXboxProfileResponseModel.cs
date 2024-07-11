using minerobe.api.Entity.Integration;

namespace minerobe.api.ResponseModel.Integration.JavaXbox
{
    public class JavaXboxProfileResponseModel
    {
        public Guid AccountId { get; set; }
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
                AccountId=entity.AccountId,
                Username = entity.Username,
                Skin = entity.Skins.Where(x=>x.Id==entity.CurrentSkinId).FirstOrDefault(),
                Capes = entity.Capes,
                CurrentCapeId = entity.CurrentCapeId,
            };
        }
    }
}
