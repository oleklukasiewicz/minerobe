
using System.Text;
using minerobe.api.Entity.Package;
using minerobe.api.Entity.Settings;
using minerobe.api.Helpers;

namespace minerobe.api.Model
{
    public class CurrentTextureModel
    {
        public string Texture { get; set; }
        public string Model { get; set; }
        public bool IsFlat { get; set; }
    }
    public static class CurrentTextureModelExtensions
    {
        public static CurrentTextureConfig ToEntity(this CurrentTextureModel model)
        {
            return new CurrentTextureConfig
            {
                Texture = Encoding.UTF8.GetBytes(model.Texture),
                Model = Enum.Parse<ModelType>(model.Model.ToFirstCapitalLetter()),
                IsFlat = model.IsFlat
            };
        }
    }
}