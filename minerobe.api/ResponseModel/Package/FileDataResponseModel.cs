using minerobe.api.Entity;
using minerobe.api.Entity.Package;
using System.Text;

namespace minerobe.api.ResponseModel.Package
{
    public class FileDataResponseModel
    {
        public string FileName { get; set; }
        public string Content { get; set; }
    }
    public static class FileDataResponseModelExtensions
    {
        public static FileDataResponseModel ToResponseModel(this FileData entity, bool toSnapshot = true)
        {

            var content = toSnapshot ?
                entity?.ContentSnapshot != null ? Encoding.UTF8.GetString(entity?.ContentSnapshot) : "" : entity?.Content != null ? Encoding.UTF8.GetString(entity?.Content) : "";
            return new FileDataResponseModel
            {
                FileName = entity.FileName,
                Content = content,
            };
        }
    }
}
