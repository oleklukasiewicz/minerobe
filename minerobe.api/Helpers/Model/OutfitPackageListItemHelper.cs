using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.Package.ResponseModel;
using minerobe.api.Modules.Core.PackageAgregation.Entity;

namespace minerobe.api.Helpers.Model
{
    public static class OutfitPackageListItemHelper
    {
        public static List<OutfitPackageListItemResponseModel> ToOutfitPackageListItem(this PagedResponse<OutfitPackageAgregationResponse> page, int maxLayersCount = 2)
        {
            var items = new List<OutfitPackageListItemResponseModel>();
            foreach (var item in page.Items)
            {
                if (item.Package.Type == PackageType.Set)
                    items.Add(item.Package.ToListItemResponseModel(-1, -1, item.IsInWardrobe, item.IsInCollection));
                else
                    items.Add(item.Package.ToListItemResponseModel(maxLayersCount, 1, item.IsInWardrobe, item.IsInCollection));
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
