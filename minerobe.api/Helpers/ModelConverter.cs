using minerobe.api.Entity;
using minerobe.api.Entity.Collection;
using minerobe.api.Entity.Package;
using minerobe.api.Entity.Settings;
using minerobe.api.Entity.Summary;
using minerobe.api.Entity.User;
using minerobe.api.Entity.Wardrobe;
using minerobe.api.Helpers.Model;
using minerobe.api.Model;
using minerobe.api.Model.Package;
using minerobe.api.ResponseModel;
using minerobe.api.ResponseModel.Collection;
using minerobe.api.ResponseModel.Package;
using minerobe.api.ResponseModel.User;
using minerobe.api.ResponseModel.Wardrobe;
using minerobe.api.Services.Interface;
using System.Text;
using System.Text.Unicode;
using System.Threading.Tasks;

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
        //map paged response to another type 
        public static async Task<PagedResponse<TDestination>> MapResponse<T, TDestination>(this PagedResponse<T> response, Func<T, Task<TDestination>> map)
        {
            var mapped = new List<TDestination>();
            foreach (var item in response.Items)
            {
                var mappedItem = await map(item);
                mapped.Add(mappedItem);
            }

            var pagedResponse = new PagedResponse<TDestination>
            {
                Items = mapped,
                Page = response.Page,
                PageSize = response.PageSize,
                Total = response.Total
            };
            return pagedResponse;
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
