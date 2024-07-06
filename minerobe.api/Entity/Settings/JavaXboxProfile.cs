namespace minerobe.api.ResponseModel.Integration.JavaXbox
{
    public class JavaXboxProfile
    {
        public string UserId { get; set; }
        public string Username { get; set; }
        public List<JavaXboxSkin> Skins { get; set; }
        public List<JavaXboxCape> Capes { get; set; }
        public Guid? CurrentSkinId { get; set; }
        public Guid? CurrentCapeId { get; set; }
    }
    public class JavaXboxCape
    {
        public Guid? Id { get; set; }
        public byte[] Texture { get; set; }
        public string Name { get; set; }
    }
    public class JavaXboxSkin
    {
        public Guid? Id { get; set; }
        public byte[] Texture { get; set; }
        public string Name { get; set; }
    }
}
