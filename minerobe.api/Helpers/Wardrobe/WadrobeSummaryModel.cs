namespace minerobe.api.Helpers.WardrobeHelpers
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
