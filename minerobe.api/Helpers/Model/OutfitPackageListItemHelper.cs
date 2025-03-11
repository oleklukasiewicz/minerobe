using Microsoft.EntityFrameworkCore;
using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.Package.Interface;
using minerobe.api.Modules.Core.Package.ResponseModel;
using minerobe.api.Modules.Core.PackageAgregation.Entity;
using minerobe.api.Modules.Core.PackageAgregation.Interface;
using minerobe.api.Modules.Core.User.Entity;
using minerobe.api.Modules.Core.User.Interface;
using minerobe.api.Modules.Core.Wardrobe.Interface;

namespace minerobe.api.Helpers.Model
{
    public static class OutfitPackageListItemHelper
    {
        public static List<OutfitPackageListItemResponseModel> AddUserContextToPage(this PagedResponse<OutfitPackageAgregationResponse> page, int maxLayersCount = 2)
        {
            var items = new List<OutfitPackageListItemResponseModel>();
            foreach (var item in page.Items)
            {
                if (item.Package.Type == PackageType.Set)
                    items.Add(item.Package.ToListItemResponseModel(-1, -1, item.IsInWardrobe));
                else
                    items.Add(item.Package.ToListItemResponseModel(maxLayersCount, 1, item.IsInWardrobe));
            }
            return items;
        }
        public static List<OutfitPackageListItemResponseModel> ToOutfitPackage(this PagedResponse<OutfitPackage> page, int maxLayerCount = 2)
        {
            var items = new List<OutfitPackageListItemResponseModel>();
            foreach (var item in page.Items)
            {
                if (item.Type == PackageType.Set)
                    items.Add(item.ToListItemResponseModel(-1, -1, false));
                else
                    items.Add(item.ToListItemResponseModel(maxLayerCount, 1, false));
            }
            return items;
        }
        public static List<OutfitPackageListItemResponseModel> ToOutfitPackageSingleLayer(this PagedResponse<OutfitPackage> page, bool isInWardrobe = false)
        {
            var items = new List<OutfitPackageListItemResponseModel>();
            foreach (var item in page.Items)
            {
                if (item.Type == PackageType.Set)
                    items.Add(item.ToListItemResponseModel(-1, -1, isInWardrobe));
                else
                    items.Add(item.ToListItemResponseModel(1, 1, isInWardrobe));
            }
            return items;
        }

    }
}
