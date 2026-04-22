namespace minerobe.api.Modules.Core.Package.Model
{
    public class OutfitPackageRenderConfigModel
    {
        public Guid PackageId { get; set; }
        public bool IsFlatten { get; set; }
        public string Model { get; set; }
        public bool UseBaseTexture { get; set; }
        public Guid? LayerId { get; set; }
    }
}
