using minerobe.api.Modules.Core.Package.Entity;
using System.Text;

namespace minerobe.api.Modules.Core.Package.ResponseModel
{
    public class FileDataResponseModel
    {
        public string FileName { get; set; }
        public string Content { get; set; }
    }
    public static class FileDataResponseModelExtensions
    {
        public static FileDataResponseModel ToResponseModel(this FileData entity)
        {

            var content = entity?.Content != null ? Encoding.UTF8.GetString(entity?.Content) : "";
            return new FileDataResponseModel
            {
                FileName = entity.FileName,
                Content = content,
            };
        }
    }
}
