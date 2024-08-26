using minerobe.api.Entity.Package;
using minerobe.api.Entity.Summary;

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
        public IQueryable<OutfitPackageAgregation> Filter(IQueryable<OutfitPackageAgregation> outfits)
        {
            if (!string.IsNullOrEmpty(this.Type))
            {
                var packageTypeEnum = Enum.Parse<PackageType>(this.Type.ToFirstCapitalLetter());
                outfits = outfits.Where(x => x.Type == (int)packageTypeEnum);
            }

            if (!string.IsNullOrEmpty(this.Phrase))
                outfits = outfits.Where(x => x.Name.ToLower().Contains(this.Phrase.ToLower()));

            if (this.OutfitType != null && this.OutfitType.Where(x => x.Length > 0).ToList().Count > 0)
            {
               var outfitTypeEnum = this.OutfitType.Select(x => (int)Enum.Parse<OutfitType>(x.ToFirstCapitalLetter())).ToList();
                outfits = outfits.Where(x => outfitTypeEnum.Contains(x.OutfitType));
            }
            if (this.IsShared != null)
                outfits = outfits.Where(x => x.IsShared == this.IsShared);
            if (this.Colors != null && this.Colors.Count > 0)
            {
                outfits = outfits.Where(outfit => this.Colors.Any(color => outfit.Colors.Contains(color)));
            }

            return outfits;

        }
    }
}
