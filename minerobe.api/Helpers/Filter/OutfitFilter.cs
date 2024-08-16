using minerobe.api.Entity.Package;

namespace minerobe.api.Helpers.Filter
{
    public class OutfitFilter : SimpleFilter
    {
        public string Type { get; set; }
        public List<string> OutfitType { get; set; }
        public List<string> Colors { get; set; }
        public bool? IsShared { get; set; }

        public IEnumerable<OutfitPackage> Filter(IEnumerable<OutfitPackage> outfits)
        {
            if (!string.IsNullOrEmpty(this.Type))
                outfits = outfits.Where(x => x.Type.ToString().ToLower() == this.Type.ToLower()).ToList();
            if (!string.IsNullOrEmpty(this.Phrase))
                outfits = outfits.Where(x => x.Name.ToLower().Contains(this.Phrase.ToLower())).ToList();
            if (this.OutfitType != null && this.OutfitType.Where(x => x.Length > 0).ToList().Count > 0)
            {
                this.OutfitType = this.OutfitType.Select(x => x.ToLower().ToString()).ToList();
                outfits = outfits.Where(x => this.OutfitType.Contains(x.OutfitType.ToString().ToLower())).ToList();
            }
            if (this.IsShared != null)
                outfits = outfits.Where(x => x.Social.IsShared == this.IsShared).ToList();
            if (this.Colors != null && this.Colors.Count > 0)
            {
                outfits = outfits.Where(x =>
                {
                    return x.Layers.Any(y =>
                    {
                        return this.Colors.Contains(y.Alex.ColorName) || this.Colors.Contains(y.Steve.ColorName);
                    });
                }).ToList();
            }
            return outfits;
        }
    }
}
