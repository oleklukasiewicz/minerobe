using minerobe.api.Entity;
using minerobe.api.Entity.Package;
using minerobe.api.Helpers;
using System.Text;

namespace minerobe.api.Model
{
    public class FileDataModel
    {
        public string FileName { get; set; }
        public string Content { get; set; }
        public string ContentSnapshot { get; set; }
        public string Type { get; set; }
        public string Color { get; set; }
    }
    public static class FileDataModelExtensions
    {
        public static FileData ToEntity(this FileDataModel model)
        {
            return new FileData
            {
                FileName = model.FileName,
                Content = Encoding.UTF8.GetBytes(model.Content),
                ContentSnapshot = model.ContentSnapshot == null || model.ContentSnapshot.Length == 0 ? Encoding.UTF8.GetBytes(model.Content) : Encoding.UTF8.GetBytes(model.ContentSnapshot),
                Type = Enum.Parse<OutfitType>(model.Type.ToFirstCapitalLetter()),
                Color = model.Color
            };
        }
    }
}
