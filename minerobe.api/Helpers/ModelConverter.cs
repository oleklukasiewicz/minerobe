using minerobe.api.Helpers.Model;
using System.Linq.Dynamic.Core;

namespace minerobe.api.Helpers
{
    public static class ModelConverter
    {

        public static PagedResponse<T> ToPagedResponse<T,TI>(this List<T> entity, PagedModel<TI> pagedOptions)
        {
            if (pagedOptions.PageSize == -1)
                pagedOptions.PageSize = entity.Count;
            var items = entity.Skip(pagedOptions.PageSize * (pagedOptions.Page)).Take(pagedOptions.PageSize).ToList();
            return new PagedResponse<T>
            {
                Items = items,
                Options = new PagedOptions
                {
                    Page = pagedOptions.Page,
                    PageSize = pagedOptions.PageSize,
                    Total = entity.Count
                }
            };
        }
        public static PagedResponse<T> ToPagedResponse<T,TI>(this IQueryable<T> entity, PagedModel<TI> pagedOptions)
        {
            int count = entity.Count();
            if (pagedOptions.PageSize == -1)
                pagedOptions.PageSize = count;

            if (TypeExtension.HasIdProperty<T>())
            {
                entity = entity.OrderBy("Id");
            }

            var items = entity.Skip(pagedOptions.PageSize * (pagedOptions.Page)).Take(pagedOptions.PageSize).ToList();
            return new PagedResponse<T>
            {
                Items = items,
                 Options = new PagedOptions
                {
                    Page = pagedOptions.Page,
                    PageSize = pagedOptions.PageSize,
                    Total = count
                }
            };
        }
        public static PagedResponse<TDestination> MapResponseOptions<T, TDestination>(this PagedResponse<T> response, List<TDestination> items)
        {
            var pagedResponse = new PagedResponse<TDestination>
            {
                Items = items,
                Options = new PagedOptions
                {
                    Page = response.Options.Page,
                    PageSize = response.Options.PageSize,
                    Total = response.Options.Total
                },
            };
            return pagedResponse;
        }
    }
}
