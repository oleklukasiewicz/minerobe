using minerobe.api.Entity;
using minerobe.api.Entity.Package;
using System.Text;

namespace minerobe.api.ResponseModel
{
    public class FileDataResponseModel
    {
        public string FileName { get; set; }
        public string Content { get; set; }
        public string Type { get; set; }
        public string Color { get; set; }
        public string ColorName { get; set; }
    }
    public static class FileDataResponseModelExtensions
    {
        public static FileDataResponseModel ToResponseModel(this FileData entity, bool toSnapshot = true)
        {

            var content = toSnapshot ?
                (entity?.ContentSnapshot != null ? Encoding.UTF8.GetString(entity?.ContentSnapshot) : "") : (entity?.Content != null ? Encoding.UTF8.GetString(entity?.Content) : "");
            return new FileDataResponseModel
            {
                FileName = entity.FileName,
                Content = content,
                Type = entity.Type.ToString().ToLower(),
                Color = entity.Color,
                ColorName = entity.ColorName
            };
        }
    }
}
