using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using minerobe.api.Extensions;

namespace minerobe.api.Entity.Integration
{
    public class JavaXboxProfile
    {
        public Guid Id { get; set; }
        public string AccountId { get; set; }
        public string UUID { get; set; }
        public string Username { get; set; }
        public List<JavaXboxSkin> Skins { get; set; }
        public List<JavaXboxCape> Capes { get; set; }
        public Guid? CurrentSkinId { get; set; }
        public Guid? CurrentCapeId { get; set; }
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
    }
}
