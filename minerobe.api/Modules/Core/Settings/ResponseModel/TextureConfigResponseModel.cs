using minerobe.api.Modules.Core.Settings.Entity;
using System.Text;

namespace minerobe.api.Modules.Core.Settings.ResponseModel
{
    public class TextureRenderConfigResponseModel
    {
        public string Texture { get; set; }
        public string Model { get; set; }
        public bool IsFlat { get; set; }
    }
    public static class CurrentTextureResponseModelExtensions
    {
        public static TextureRenderConfigResponseModel ToResponseModel(this TextureRenderConfig entity)
        {
            return new TextureRenderConfigResponseModel
            {
                Texture = entity.Texture != null ? Encoding.UTF8.GetString(entity.Texture) : "",
                Model = entity.Model.ToString().ToLower(),
                IsFlat = entity.IsFlat
            };
        }
    }
}