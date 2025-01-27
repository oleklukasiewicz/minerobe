using minerobe.api.Modules.Core.Package.Entity;
using System.Text;

namespace minerobe.api.Modules.Core.Package.Model
{
    public class FileDataModel
    {
        public string FileName { get; set; }
        public string Content { get; set; }
    }
    public static class FileDataModelExtensions
    {
        public static FileData ToEntity(this FileDataModel model)
        {
            return new FileData
            {
                FileName = model.FileName,
                Content = Encoding.UTF8.GetBytes(model.Content),
            };
        }
    }
}
