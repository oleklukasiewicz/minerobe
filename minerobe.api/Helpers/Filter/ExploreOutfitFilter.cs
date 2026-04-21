using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.PackageAgregation.Entity;

namespace minerobe.api.Helpers.Filter
{
    public class ExploreOutfitFilter : SimpleFilter
    {
        public string Type { get; set; }
        public List<string> OutfitType { get; set; }
        public List<string> Colors { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsNew { get; set; }
        public bool IsPopular { get; set; }

        public IQueryable<OutfitPackageAgregation> Filter(IQueryable<OutfitPackageAgregation> outfits)
        {
            outfits = outfits.Where(x => x.IsShared == true);

            if (this.IsPopular)
            {
                var avgDownloads = outfits.Any() ? outfits.Average(x => x.Downloads) : 0;
                var avgLikes = outfits.Any() ? outfits.Average(x => x.Likes) : 0;
                outfits = outfits.Where(x => x.Downloads >= Math.Floor(avgDownloads) || x.Likes >= Math.Floor(avgLikes));
            }

            if (!string.IsNullOrEmpty(this.Type))
            {
                var packageTypeEnum = Enum.Parse<PackageType>(this.Type.ToFirstCapitalLetter());
                outfits = outfits.Where(x => x.Type == packageTypeEnum);
            }

            if (this.IsFeatured)
                outfits = outfits.Where(x => x.IsFeatured == true);
            if (this.IsNew)
                outfits = outfits.Where(x => x.CreatedAt >= DateTime.Now.AddDays(-7));


            if (!string.IsNullOrEmpty(this.Phrase))
                outfits = outfits.Where(x => x.Name.ToLower().Contains(this.Phrase.ToLower()));

            if (this.OutfitType != null && this.OutfitType.Where(x => x.Length > 0).ToList().Count > 0)
            {
                var outfitTypeEnum = this.OutfitType.Select(x => Enum.Parse<OutfitType>(x.ToFirstCapitalLetter())).ToList();
                outfits = outfits.Where(x => outfitTypeEnum.Contains(x.OutfitType));
            }
            if (this.Colors != null && this.Colors.Count > 0)
            {
                outfits = outfits.Where(outfit => this.Colors.Any(color => outfit.PackageColorName == color) || this.Colors.Any(color => outfit.ColorName == color));
            }

            return outfits;

        }
    }
}
