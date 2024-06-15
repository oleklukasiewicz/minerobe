using minerobe.api.Entity.Package;

namespace minerobe.api.Entity.Settings
{
    public class UserLinkedAccount
    {
        public dynamic LinkedAccount { get; set; }

        public UserLinkedAccountSkin CurrentSkin { get; set; }
    }
    public class UserLinkedAccountSkin
    {
        public Guid PackageId { get; set; }
        public ModelType Model { get; set; }
        public byte[] Texture { get; set; }

    }
}
