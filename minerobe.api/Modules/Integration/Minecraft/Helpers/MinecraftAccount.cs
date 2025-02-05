using minerobe.api.Modules.Core.Package.Entity;

namespace minerobe.api.Modules.Integration.Minecraft.Helpers
{
    public class MinecraftAccount
    {
        public Guid Id { get; set; }
        public string AccountId { get; set; }
        public MinecraftProfile Profile { get; set; }
    }
    public class MinecraftCape
    {
        public Guid? Id { get; set; }
        public string Texture { get; set; }
        public string Name { get; set; }
    }
    public class MinecraftSkin
    {
        public Guid? Id { get; set; }
        public string Texture { get; set; }
        public string Name { get; set; }
        public string Model { get; set; }
    }
    public class MinecraftProfile
    {
        public string UUID { get; set; }
        public string Username { get; set; }
        public List<MinecraftSkin> Skins { get; set; }
        public List<MinecraftCape> Capes { get; set; }
        public Guid? CurrentSkinId { get; set; }
        public Guid? CurrentCapeId { get; set; }
    }
}
