using minerobe.api.Modules.Core.Settings.Entity;

namespace minerobe.api.Modules.Core.Settings.ResponseModel
{
    public class TextureConfigResponseModel
    {
        public Guid PackageId { get; set; }
        public string Model { get; set; }
        public bool IsFlat { get; set; }
    }
    public static class CurrentTextureResponseSimpleModelExtensions
    {
        public static TextureConfigResponseModel ToConfigResponse(this TextureRenderConfig entity)
        {
            return new TextureConfigResponseModel
            {
                Model = entity.Model.ToString().ToLower(),
                IsFlat = entity.IsFlat
            };
        }
    }
}
