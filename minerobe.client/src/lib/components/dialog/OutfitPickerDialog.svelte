<script lang="ts">
  import { OUTFIT_TYPE_ARRAY } from "$src/data/consts/outfit";
  import { PagedModel, type PagedResponse } from "$src/data/models/base";
  import { OutfitFilter } from "$src/data/models/filter";
  import type { OutfitPackage } from "$src/data/models/package";
  import { createEventDispatcher } from "svelte";
  import Dialog from "../base/Dialog/Dialog.svelte";
  import PagedList from "../list/PagedList/PagedList.svelte";
  import Search from "../base/Search/Search.svelte";
  import Select from "../base/Select/Select.svelte";
  import OutfitPackagePickerList from "../outfit/OutfitPackagePickerList/OutfitPackagePickerList.svelte";
  import { COLORS_ARRAY } from "$src/data/consts/color";
  import ColorSelect from "../other/ColorSelect/ColorSelect.svelte";
  import SortSelect from "../base/SortSelect/SortSelect.svelte";
  import { OUTFIT_PACKAGE_SORT_OPTIONS } from "$src/data/consts/sort";
  import Button from "../base/Button/Button.svelte";

  const dispatch = createEventDispatcher();

  export let items: PagedResponse<OutfitPackage>;
  export let packageContext: OutfitPackage = null;
  export let options: PagedModel<OutfitFilter> = new PagedModel<OutfitFilter>();
  export let pageSizes = [5, 10, 15, 20];
  export let open = false;
  export let label = "Outfit Picker";
  export let loading = true;
  export let multiple = true;

  let selectedItems: OutfitPackage[] = [];

  const onFiltersUpdate = function () {
    if (options.sort[0] == null) options.sort = [];
    options.page = 0;
    dispatch("filter", { options: options });
  };
  const onPageChanged = function (e) {
    const page = e.detail.options;
    options.page = page.options.page;
    options.pageSize = page.options.pageSize;
    if (options.sort[0] == null) options.sort = [];
    dispatch("optionsChanged", { options: options });
  };
  const onSelect = function (items) {
    selectedItems = items;
    if (!multiple) dispatch("select", { items: items });
  };
  const onSelectClick = function () {
    dispatch("select", { items: selectedItems });
  };

  const onOpen = function (v) {
    selectedItems = [];
  };
  $: onOpen(open);
</script>

<Dialog bind:open {label}>
  <div id="outfit-picker-dialog">
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
        items={OUTFIT_TYPE_ARRAY}
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
        selectable={multiple}
        {packageContext}
        items={pagedItems}
        pageSize={pagedPageSize}
        loading={pagedLoading}
        on:select={(e) => onSelect(e.detail.items)}
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
  #outfit-picker-dialog {
    min-width: 50vw;
    max-width: 600px;
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
