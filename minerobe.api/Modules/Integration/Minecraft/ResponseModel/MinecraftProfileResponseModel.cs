using minerobe.api.Modules.Integration.Minecraft.Helpers;

namespace minerobe.api.Modules.Integration.Minecraft.ResponseModel
{
    public class MinecraftProfileResponseModel
    {
        public Guid Id { get; set; }
        public string Username { get; set; }
        public List<MinecraftCape> Capes { get; set; }
        public Guid? CurrentCapeId { get; set; }
    }
    public static class JavaXboxProfileResponseModelExtensions
    {
        public static MinecraftProfileResponseModel ToResponseModel(this MinecraftAccount entity)
        {
            return new MinecraftProfileResponseModel
            {
                Id = entity.Id,
                Username = entity.Profile.Username,
                   Capes = entity.Profile.Capes,
                CurrentCapeId = entity.Profile?.CurrentCapeId,
            };
        }
    }
}
