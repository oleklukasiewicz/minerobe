namespace minerobe.api.Helpers.Model
{
    public class PagedOptions<T>
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public T Filter { get; set; }
    }
    public class PagedResponse<T>
    {
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public List<T> Items { get; set; }
    }
}
