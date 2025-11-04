<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //consts
  import { COLORS_ARRAY } from "$src/data/consts/color";
  import { OUTFIT_PACKAGE_SORT_OPTIONS } from "$src/data/consts/sort";
  import { OUTFIT_TYPE_WITH_SET_ARRAY } from "$src/data/consts/outfit";
  //model
  import { PagedModel, type PagedResponse } from "$src/data/models/base";
  import { OutfitFilter } from "$src/data/models/filter";
  import type { OutfitLayer, OutfitPackage } from "$src/data/models/package";
  //components
  import Dialog from "../base/Dialog/Dialog.svelte";
  import PagedList from "../list/PagedList/PagedList.svelte";
  import Search from "../base/Search/Search.svelte";
  import Select from "../base/Select/Select.svelte";
  import OutfitPackagePickerList from "../outfit/OutfitPackagePickerList/OutfitPackagePickerList.svelte";
  import ColorSelect from "../other/ColorSelect/ColorSelect.svelte";
  import SortSelect from "../base/SortSelect/SortSelect.svelte";
  import Button from "../base/Button/Button.svelte";
  import type { OutfitPackageCollection } from "$src/data/models/collection";

  const dispatch = createEventDispatcher();

  export let items: PagedResponse<OutfitPackage>;
  export let packageContext: OutfitPackageCollection = null;
  export let options: PagedModel<OutfitFilter> = new PagedModel<OutfitFilter>();
  export let pageSizes = [5, 10, 15, 20];
  export let open = false;
  export let label = "Outfit Picker";
  export let loading = true;
  export let multiple = true;
  export let baseTexture: OutfitLayer = null;

  export let selectedItems: OutfitPackage[] = [];

  const onFiltersUpdate = function () {
    if (options.sort[0]?.value == null) options.sort = [];
    options.page = 0;
    dispatch("filter", { options: options });
  };
  const onPageChanged = function (e) {
    const page = e.detail.options;
    options.page = page.options.page;
    options.pageSize = page.options.pageSize;
    if (options.sort[0]?.value == null) options.sort = [];
    dispatch("optionsChanged", { options: options });
  };
  const onSelect = function (item) {
    dispatch("select", { items: item });
  };
  const onUnselect = function (item) {
    dispatch("unselect", { items: item });
  };
  const onSelectClick = function () {
    dispatch("selectClick", { items: selectedItems });
  };

  const onOpen = function (v) {};
  $: onOpen(open);
</script>

<Dialog bind:open {label} let:isMobile on:close>
  <div id="collection-items-picker-dialog" class:mobile={isMobile}>
    <div class="dialog-filters">
      <SortSelect
        clearable
        items={OUTFIT_PACKAGE_SORT_OPTIONS}
        bind:selectedItem={options.sort[0]}
        on:select={onFiltersUpdate}
        on:clear={onFiltersUpdate}
      />
      <ColorSelect
        items={COLORS_ARRAY}
        autocomplete
        bind:selectedItem={options.filter.colors}
        placeholder="Colors"
        itemText="normalizedName"
        itemValue="name"
        dropDownStyle="max-height: 275px"
        multiple
        clearable
        on:select={onFiltersUpdate}
        on:clear={onFiltersUpdate}
      />
      <Select
        items={OUTFIT_TYPE_WITH_SET_ARRAY}
        placeholder="Outfit type"
        autocomplete
        itemText="normalizedName"
        multiple
        clearable
        itemValue="name"
        bind:selectedItem={options.filter.outfitType}
        on:select={onFiltersUpdate}
        on:clear={onFiltersUpdate}
      />
      <Search
        dense
        bind:value={options.filter.phrase}
        on:search={onFiltersUpdate}
      />
    </div>
    <PagedList
      {items}
      pageSize={options.pageSize}
      {pageSizes}
      {loading}
      on:optionsChanged={onPageChanged}
      let:items={pagedItems}
      let:pageSize={pagedPageSize}
      let:loading={pagedLoading}
    >
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
        on:select={(e) => onSelect(e.detail.items)}
        on:unselect={(e) => onUnselect(e.detail.items)}
      />
      {#if items?.items?.length === 0 && !loading}
        <div class="no-items-error">No items found</div>
      {/if}
      <div slot="footer" id="select-footer">
        {#if multiple}
          <Button
            on:click={onSelectClick}
            label={"Add " + "(" + selectedItems.length + ")"}
            disabled={selectedItems.length === 0}
          />
        {/if}
      </div>
    </PagedList>
  </div>
</Dialog>

<style lang="scss">
  #collection-items-picker-dialog {
    min-width: 50vw;
    max-width: 600px;
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
      margin-bottom: 8px;
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
