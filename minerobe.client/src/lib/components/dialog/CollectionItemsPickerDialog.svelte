<script lang="ts">
  //consts
  import { COLORS_ARRAY } from "$src/data/consts/color";
  import { OUTFIT_PACKAGE_SORT_OPTIONS } from "$src/data/consts/sort";
  import { OUTFIT_TYPE_WITH_SET_ARRAY } from "$src/data/consts/outfit";

  //models
  import { PagedModel, type PagedResponse } from "$src/data/models/base";
  import { OutfitFilter } from "$src/data/models/filter";
  import type { OutfitLayer, OutfitPackage } from "$src/data/models/package";
  import type { OutfitPackageCollection } from "$src/data/models/collection";

  import { run } from 'svelte/legacy';

  //main imports
    //consts
  //model
  //components
  import Dialog from "../base/Dialog/Dialog.svelte";
  import PagedList from "../list/PagedList/PagedList.svelte";
  import Search from "../base/Search/Search.svelte";
  import Select from "../base/Select/Select.svelte";
  import OutfitPackagePickerList from "../outfit/OutfitPackagePickerList/OutfitPackagePickerList.svelte";
  import ColorSelect from "../other/ColorSelect/ColorSelect.svelte";
  import SortSelect from "../base/SortSelect/SortSelect.svelte";
  import Button from "../base/Button/Button.svelte";


  interface CollectionItemsPickerDialogProps {
    items: PagedResponse<OutfitPackage>;
    packageContext?: OutfitPackageCollection;
    options?: PagedModel<OutfitFilter>;
    pageSizes?: any;
    open?: boolean;
    label?: string;
    loading?: boolean;
    baseTexture?: OutfitLayer;
    selectedItems?: OutfitPackage[];
    onfilter?: (event?: any) => void;
    onoptionsChanged?: (event?: any) => void;
    onselect?: (event?: any) => void;
    onunselect?: (event?: any) => void;
    onselectClick?: (event?: any) => void;
    onclose?: (event?: any) => void;
  }

  let {
    items,
    packageContext = null,
    options = $bindable(new PagedModel<OutfitFilter>()),
    pageSizes = [5, 10, 15, 20],
    open = $bindable(false),
    label = "Items Picker",
    loading = true,
    baseTexture = null,
    selectedItems = $bindable([])
  ,
    onfilter = null,
    onoptionsChanged = null,
    onselect = null,
    onunselect = null,
    onselectClick = null,
    onclose = null
  }: CollectionItemsPickerDialogProps = $props();

  let selectedSort = $state(null);
  let selectedColors = $state([]);
  let selectedOutfitTypes = $state([]);
  let phrase = $state("");

  const ensureOptionsShape = () => {
    if (!options) options = new PagedModel<OutfitFilter>();
    if (!options.filter) options.filter = new OutfitFilter();
    if (!Array.isArray(options.sort)) options.sort = [];
    if (!Array.isArray(options.filter.colors)) options.filter.colors = [];
    if (!Array.isArray(options.filter.outfitType)) options.filter.outfitType = [];
    if (options.filter.phrase == null) options.filter.phrase = "";
    if (options.page == null) options.page = 0;
    if (options.pageSize == null) options.pageSize = 12;
  };

  const syncLocalFiltersFromOptions = () => {
    ensureOptionsShape();
    selectedSort = options.sort[0] ?? null;
    selectedColors = [...options.filter.colors];
    selectedOutfitTypes = [...options.filter.outfitType];
    phrase = options.filter.phrase ?? "";
  };

  const syncOptionsFromLocalFilters = () => {
    ensureOptionsShape();
    options.sort = selectedSort?.value == null ? [] : [selectedSort];
    options.filter.colors = selectedColors ?? [];
    options.filter.outfitType = selectedOutfitTypes ?? [];
    options.filter.phrase = phrase ?? "";
  };

  run(() => {
    syncLocalFiltersFromOptions();
  });

  const onFiltersUpdate= function () {
    syncOptionsFromLocalFilters();
    options.page = 0;
    onfilter?.({ options: options });
  };
  const onPageChanged= function (e) {
    const page = e.options;
    syncOptionsFromLocalFilters();
    options.page = page.options.page;
    options.pageSize = page.options.pageSize;
    onoptionsChanged?.({ options: options });
  };
  const onSelect= function (item) {
    onselect?.({ items: item });
  };
  const onUnselect= function (item) {
    onunselect?.({ items: item });
  };
  const onSelectClick= function () {
    onselectClick?.({ items: selectedItems });
  };

  const onOpen= function (v) {};
  run(() => {
    onOpen(open);
  });
  const onClose= function () {
    open = false;
    onclose?.();
  };
</script>

<Dialog bind:open {label}  onclose={onClose}>
  {#snippet children({ isMobile })}
    <div id="collection-items-picker-dialog" class:mobile={isMobile}>
      <div class="dialog-filters">
        <SortSelect
          clearable
          items={OUTFIT_PACKAGE_SORT_OPTIONS}
          bind:value={selectedSort}
          onselect={onFiltersUpdate}
          onclear={onFiltersUpdate}
        />
        <ColorSelect
          items={COLORS_ARRAY}
          autocomplete
          bind:value={selectedColors}
          placeholder="Colors"
          itemText="normalizedName"
          itemValue="name"
          dropDownStyle="max-height: 275px"
          multiple
          clearable
          onselect={onFiltersUpdate}
          onclear={onFiltersUpdate}
        />
        <Select
          items={OUTFIT_TYPE_WITH_SET_ARRAY}
          placeholder="Outfit type"
          autocomplete
          itemText="normalizedName"
          multiple
          clearable
          itemValue="name"
          bind:value={selectedOutfitTypes}
          onselect={onFiltersUpdate}
          onclear={onFiltersUpdate}
        />
        <Search
          dense
          bind:value={phrase}
          onsearch={onFiltersUpdate}
        />
      </div>
      <PagedList
        bind:items={items}
        pageSize={options.pageSize}
        {pageSizes}
        {loading}
        onoptionsChanged={onPageChanged}
        
        
        
      >
        {#snippet children({ items: pagedItems, pageSize: pagedPageSize, loading: pagedLoading })}
            <OutfitPackagePickerList
            bind:selectedItems
            selectable={true}
            disableContext={packageContext}
            disableFunction={(context: OutfitPackageCollection, item) => {
              return false;
            }}
            items={pagedItems}
            pageSize={pagedPageSize}
            loading={pagedLoading}
            {baseTexture}
            onselect={(e) => onSelect(e.items)}
            onunselect={(e) => onUnselect(e.items)}
          />
          {#if items?.items?.length === 0 && !loading}
            <div class="no-items-error">No items found</div>
          {/if}
          {/snippet}
          {#snippet footer()}
            <div  id="select-footer">
            <Button label="Save items" onclick={onClose} />
          </div>
          {/snippet}
      </PagedList>
    </div>
  {/snippet}
</Dialog>

<style lang="scss">
  #collection-items-picker-dialog {
    min-width: 50vw;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    &.mobile {
      min-width: 100%;
      max-width: 100%;
    }
    #select-footer {
      max-width: 200px;
    }
    .dialog-filters {
      display: grid;
      margin-left: auto;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 8px;
      margin: 8px 0px;
    }
    .no-items-error {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100px;
      font-family: minecraft;
      font-size: var(--size-font-base);
    }
  }
</style>
