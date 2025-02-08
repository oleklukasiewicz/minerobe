namespace minerobe.api.Helpers.Model
{
    public class PagedModel<T>
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public T Filter { get; set; }
        public List<SortOption>? Sort { get; set; }
    }
    public class PagedResponse<T>
    {
        public PagedOptions Options { get; set; } = new PagedOptions();
        public List<SortOption> Sort { get; set; } = new List<SortOption>();
        public List<T> Items { get; set; } = new List<T>();
    }
    public class PagedOptions
    {
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }
    public class SortOption
    {
        public string Value { get; set; }
        public bool IsDesc { get; set; }
    }
}
