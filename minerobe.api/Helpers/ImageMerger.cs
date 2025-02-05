using minerobe.api.Modules.Core.Package.Entity;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace minerobe.api.Helpers
{
    public static class ImageMerger
    {
        public static async Task<Image<Rgba32>> Merge(List<byte[]> textures, ModelType type, bool flatten = false, List<string> excludedPartsFromFlatten = null)
        {
            if (excludedPartsFromFlatten == null)
                excludedPartsFromFlatten = new List<string> { "head" };

            var modelMap = type == ModelType.Steve ? ModelMaps.STEVE_MODEL : ModelMaps.ALEX_MODEL;

            List<Image<Rgba32>> images = new List<Image<Rgba32>>();
            foreach (var image in textures)
            {
                using (var stream = new MemoryStream(image))
                {
                    //byte to string
                    var str = Encoding.UTF8.GetString(image).Replace("data:image/png;base64,", "");
                    var imgBytes = Convert.FromBase64String(str);
                    images.Add(Image.Load<Rgba32>(imgBytes));
                }
            }
            //get size of first image
            var size = images.First().Size;
            //create new canvas
            var canvas = new Image<Rgba32>(size.Width, size.Height);
            //iterate parts
            for (var i = 0; images.Count > i; i++)
            {
                var image = images[i];
                for (var j = 0; modelMap.Count > j; j++)
                {
                    var part = modelMap.ElementAt(j);
                    var mergedpart = await ReplaceLowerPart(image, canvas, part.Value);

                    canvas = mergedpart;
                }
            }
            if (flatten)
            {
                //flatten image
                for (var i = 0; modelMap.Count > i; i++)
                {
                    var part = modelMap.ElementAt(i);
                    if (excludedPartsFromFlatten.Contains(part.Key))
                    {
                        continue;
                    }
                    canvas = await FlatPart(canvas, part.Value);
                }
            }


            return canvas;
        }
        public static async Task<Image<Rgba32>> ReplaceLowerPart(Image<Rgba32> image, Image<Rgba32> lowerLayer, ModelMapPart modelMap)
        {
            //get source image inner and outer parts
            var upperOuter = image.Clone();
            upperOuter.Mutate(x => x.Crop(modelMap.OuterTextureArea));
            var upperInner = image.Clone();
            upperInner.Mutate(x => x.Crop(modelMap.TextureArea));

            //merge inner parts
            lowerLayer.Mutate(x => x.DrawImage(upperInner, new Point(modelMap.TextureArea.X, modelMap.TextureArea.Y), 1));
            //iterate over pixels of outer parts
            for (var x = 0; modelMap.OuterTextureArea.Width > x; x++)
            {
                for (var y = 0; modelMap.OuterTextureArea.Height > y; y++)
                {
                    var upperInnerPixel = upperInner[x, y];

                    if (upperInnerPixel.R != 0 || upperInnerPixel.G != 0 || upperInnerPixel.B != 0)
                        lowerLayer[x + modelMap.OuterTextureArea.X, y + modelMap.OuterTextureArea.Y] = new Rgba32(0, 0, 0, 0);
                }
            }
            lowerLayer.Mutate(x => x.DrawImage(upperOuter, new Point(modelMap.OuterTextureArea.X, modelMap.OuterTextureArea.Y), 1));

            //paste lowerlayer into lowerImage
            // lowerLayer.Mutate(x => x.DrawImage(lowerLayerClone, new Point(modelMap.OuterTextureArea.X, modelMap.OuterTextureArea.Y), 1));

            return lowerLayer;

        }

        public static async Task<Image<Rgba32>> FlatPart(Image<Rgba32> image, ModelMapPart modelMap)
        {
            var outer = image.Clone();
            outer.Mutate(x => x.Crop(modelMap.OuterTextureArea));
            image.Mutate(x => x.DrawImage(outer, new Point(modelMap.TextureArea.X, modelMap.TextureArea.Y), 1));
            //clear outer part iterate over pixels of outer parts
            for (var x = 0; modelMap.OuterTextureArea.Width > x; x++)
            {
                for (var y = 0; modelMap.OuterTextureArea.Height > y; y++)
                {
                    image[x + modelMap.OuterTextureArea.X, y + modelMap.OuterTextureArea.Y] = new Rgba32(0, 0, 0, 0);
                }
            }
            return image;

        }
    }
    public class ModelMapPart
    {
        public string Name { get; set; }
        public Rectangle TextureArea { get; set; }
        public Rectangle OuterTextureArea { get; set; }
    }

    public static class ModelMaps
    {
        public static readonly Dictionary<string, ModelMapPart> STEVE_MODEL = new Dictionary<string, ModelMapPart>
        {
            { "head", new ModelMapPart { Name = "head", TextureArea = new Rectangle(0, 0, 32, 16), OuterTextureArea = new Rectangle(32, 0, 32, 16) } },
            { "body", new ModelMapPart { Name = "body", TextureArea = new Rectangle(16, 16, 24, 16), OuterTextureArea = new Rectangle(16, 32, 24, 16) } },
            { "leftLeg", new ModelMapPart { Name = "leftLeg", TextureArea = new Rectangle(16, 48, 16, 16), OuterTextureArea = new Rectangle(0, 48, 16, 16) } },
            { "rightLeg", new ModelMapPart { Name = "rightLeg", TextureArea = new Rectangle(0, 16, 16, 16), OuterTextureArea = new Rectangle(0, 32, 16, 16) } },
            { "leftArm", new ModelMapPart { Name = "leftArm", TextureArea = new Rectangle(32, 48, 16, 16), OuterTextureArea = new Rectangle(48, 48, 16, 16) } },
            { "rightArm", new ModelMapPart { Name = "rightArm", TextureArea = new Rectangle(40, 16, 16, 16), OuterTextureArea = new Rectangle(40, 32, 16, 16) } }
        };

        public static readonly Dictionary<string, ModelMapPart> ALEX_MODEL = new Dictionary<string, ModelMapPart>
        {
            { "head", STEVE_MODEL["head"] },
            { "body", STEVE_MODEL["body"] },
            { "leftLeg", STEVE_MODEL["leftLeg"] },
            { "rightLeg", STEVE_MODEL["rightLeg"] },
            { "leftArm", new ModelMapPart { Name = "leftArm", TextureArea = new Rectangle(32, 48, 14, 16), OuterTextureArea = new Rectangle(48, 48, 14, 16) } },
            { "rightArm", new ModelMapPart { Name = "rightArm", TextureArea = new Rectangle(40, 16, 14, 16), OuterTextureArea = new Rectangle(40, 32, 14, 16) } }
        };
    }
}
