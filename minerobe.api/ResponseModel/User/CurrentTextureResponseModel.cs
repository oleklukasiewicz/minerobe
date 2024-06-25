using System.Text;
using minerobe.api.Entity.Settings;

namespace minerobe.api.ResponseModel.User
{
    public class CurrentTextureResponseModel
    {
        public string Texture { get; set; }
        public string Model { get; set; }
        public bool IsFlat { get; set; }
    }
    public static class CurrentTextureResponseModelExtensions
    {
        public static CurrentTextureResponseModel ToResponseModel(this CurrentTextureConfig entity)
        {
            return new CurrentTextureResponseModel
            {
                Texture = entity.Texture != null? Encoding.UTF8.GetString(entity.Texture): "",
                Model = entity.Model.ToString().ToLower(),
                IsFlat = entity.IsFlat
            };
        }
    }
}