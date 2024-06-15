using minerobe.api.Entity;
using minerobe.api.Entity.Collection;
using minerobe.api.Entity.Package;
using minerobe.api.Entity.Settings;
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
using System.Text;
using System.Text.Unicode;

namespace minerobe.api.Helpers
{
    public static class ModelConverter
    {

       public static PagedResponse<T> ToPagedResponse<T>(this List<T> entity, int page, int pageSize)
        {
            if(pageSize==-1)
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
       
    }
}
