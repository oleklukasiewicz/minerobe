using minerobe.api.Modules.Core.Package.Entity;

namespace minerobe.api.Helpers.Integration
{
    public class JavaXboxProfile
    {
        public Guid Id { get; set; }
        public string AccountId { get; set; }
        public ProfileData Profile { get; set; }
    }
    public class JavaXboxCape
    {
        public Guid? Id { get; set; }
        public string Texture { get; set; }
        public string Name { get; set; }
    }
    public class JavaXboxSkin
    {
        public Guid? Id { get; set; }
        public string Texture { get; set; }
        public string Name { get; set; }
        public string Variant { get; set; }
    }
    public class ProfileData
    {
        public string UUID { get; set; }
        public string Username { get; set; }
        public List<JavaXboxSkin> Skins { get; set; }
        public List<JavaXboxCape> Capes { get; set; }
        public Guid? CurrentSkinId { get; set; }
        public Guid? CurrentCapeId { get; set; }
    }
}
