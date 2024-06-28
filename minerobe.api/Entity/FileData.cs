using minerobe.api.Entity.Package;

namespace minerobe.api.Entity
{
    public class FileData
    {
        public string FileName { get; set; }
        public byte[] Content { get; set; }
        public byte[] ContentSnapshot { get; set; }
        public OutfitType Type { get; set; }
        public string Color { get; set; }
        public string ColorName { get; set; }

    }
}
