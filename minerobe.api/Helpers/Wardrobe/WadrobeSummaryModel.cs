namespace minerobe.api.Helpers.Wardrobe
{
    public class WadrobeSummary
    {
        public List<WadrobeSummaryOutfitType> OutfitTypes { get; set; }
    }
    public class WadrobeSummaryOutfitType
    {
        public string OutfitType { get; set; }
        public int Count { get; set; }
    }
}
