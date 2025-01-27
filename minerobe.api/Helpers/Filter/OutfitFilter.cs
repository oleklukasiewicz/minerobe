using minerobe.api.Entity.Agregation;
using minerobe.api.Modules.Core.Package.Entity;

namespace minerobe.api.Helpers.Filter
{
    public class OutfitFilter : SimpleFilter
    {
        public string Type { get; set; }
        public List<string> OutfitType { get; set; }
        public List<string> Colors { get; set; }
        public bool? IsShared { get; set; }

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
