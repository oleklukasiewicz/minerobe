using minerobe.api.Helpers;
using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.Settings.Entity;
using System.Text;

namespace minerobe.api.Modules.Core.Settings.Model
{
    public class TextureRenderConfigModel
    {
        public string Texture { get; set; }
        public string Model { get; set; }
        public bool IsFlat { get; set; }
        public Guid? CapeId { get; set; }
    }
    public static class CurrentTextureModelExtensions
    {
        public static TextureRenderConfig ToEntity(this TextureRenderConfigModel model)
        {
            return new TextureRenderConfig
            {
                Texture = Encoding.UTF8.GetBytes(model.Texture),
                Model = Enum.Parse<ModelType>(model.Model.ToFirstCapitalLetter()),
                IsFlat = model.IsFlat,
                CapeId = model.CapeId
            };
        }
    }
}