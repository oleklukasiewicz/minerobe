namespace minerobe.api.Entity
{
    public class FileData
    {
        public string FileName { get; set; }
        public byte[] Content { get; set; }
        public byte[] ContentSnapshot { get; set; }

    }
}
