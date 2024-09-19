using minerobe.api.Helpers.Model;

namespace minerobe.api.Helpers
{
    public static class ModelConverter
    {

        public static PagedResponse<T> ToPagedResponse<T>(this List<T> entity, int page, int pageSize)
        {
            if (pageSize == -1)
                pageSize = entity.Count;
            var items = entity.Skip(pageSize * (page)).Take(pageSize).ToList();
            return new PagedResponse<T>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                Total = entity.Count
            };
        }
        public static PagedResponse<T> ToPagedResponse<T>(this IQueryable<T> entity, int page, int pageSize)
        {
            int count = entity.Count();
            if (pageSize == -1)
                pageSize = count;
            var items = entity.Skip(pageSize * (page)).Take(pageSize).ToList();
            return new PagedResponse<T>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                Total = count
            };
        }
        public static PagedResponse<TDestination> MapResponseOptions<T, TDestination>(this PagedResponse<T> response, List<TDestination> items)
        {
            var pagedResponse = new PagedResponse<TDestination>
            {
                Items = items,
                Page = response.Page,
                PageSize = response.PageSize,
                Total = response.Total
            };
            return pagedResponse;
        }
    }
}
