<script lang="ts">
  //consts
  import { COLORS_ARRAY } from "$src/data/consts/color";
  import { OUTFIT_PACKAGE_SORT_OPTIONS } from "$src/data/consts/sort";
  import { OUTFIT_TYPE_ARRAY } from "$src/data/consts/outfit";

  //models
  import { PagedModel, type PagedResponse } from "$src/data/models/base";
  import { OutfitFilter } from "$src/data/models/filter";
  import type { OutfitPackage } from "$src/data/models/package";

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

  interface Props {
    items: PagedResponse<OutfitPackage>;
    packageContext?: OutfitPackage;
    options?: PagedModel<OutfitFilter>;
    pageSizes?: any;
    open?: boolean;
    label?: string;
    loading?: boolean;
    multiple?: boolean;
    onfilter?: (event?: any) => void;
    onoptionsChanged?: (event?: any) => void;
    onselect?: (event?: any) => void;
  }

  let {
    items,
    packageContext = null,
    options = $bindable(new PagedModel<OutfitFilter>()),
    pageSizes = [5, 10, 15, 20],
    open = $bindable(false),
    label = "Outfit Picker",
    loading = true,
    multiple = true
  ,
    onfilter = null,
    onoptionsChanged = null,
    onselect = null
  }: Props = $props();

  let selectedItems: OutfitPackage[] = $state([]);
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
  const onSelect= function (items) {
    selectedItems = items;
    if (!multiple) onselect?.({ items: items });
  };
  const onSelectClick= function () {
    onselect?.({ items: selectedItems });
  };

  const onOpen= function (v) {
    selectedItems = [];
  };
  run(() => {
    onOpen(open);
  });
</script>

<Dialog bind:open {label} >
  {#snippet children({ isMobile })}
    <div id="outfit-picker-dialog" class:mobile={isMobile}>
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
          items={OUTFIT_TYPE_ARRAY}
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
            selectable={multiple}
            disableContext={packageContext}
            items={pagedItems}
            pageSize={pagedPageSize}
            loading={pagedLoading}
            onselectionUpdate={(e) => onSelect(e.items)}
          />
          {#if items?.items?.length === 0 && !loading}
            <div class="no-items-error">No items found</div>
          {/if}
          {/snippet}
          {#snippet footer()}
            <div  id="select-footer">
            {#if multiple}
              <Button
                onclick={onSelectClick}
                label={"Add " + "(" + selectedItems.length + ")"}
                disabled={selectedItems.length === 0}
              />
            {/if}
          </div>
          {/snippet}
      </PagedList>
    </div>
  {/snippet}
</Dialog>

<style lang="scss">
  #outfit-picker-dialog {
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
