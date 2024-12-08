<script lang="ts">
  import { OUTFIT_TYPE_ARRAY } from "$src/data/consts/outfit";
  import type { PagedResponse } from "$src/data/models/base";
  import { OutfitFilter } from "$src/data/models/filter";
  import type { OutfitPackage } from "$src/data/models/package";
  import { createEventDispatcher } from "svelte";
  import Dialog from "../base/Dialog/Dialog.svelte";
  import PagedList from "../base/PagedList/PagedList.svelte";
  import Search from "../base/Search/Search.svelte";
  import Select from "../base/Select/Select.svelte";
  import OutfitPackagePickerList from "../outfit/OutfitPackagePickerList/OutfitPackagePickerList.svelte";
  import { COLORS_ARRAY } from "$src/data/consts/color";

  const dispatch = createEventDispatcher();

  export let items: PagedResponse<OutfitPackage>;
  export let filters: OutfitFilter = new OutfitFilter();
  export let pageSizes = [5, 10, 15, 20];
  export let open = false;
  export let label = "Outfit Picker";
  export let loading = true;

  const onFiltersUpdate = function () {
    dispatch("filter", { filters: filters });
  };
</script>

<Dialog bind:open {label}>
  <div id="outfit-picker-dialog">
    <div class="dialog-filters">
      <Select
        items={COLORS_ARRAY}
        bind:selectedItem={filters.colors}
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
        itemText="normalizedName"
        multiple
        clearable
        itemValue="name"
        bind:selectedItem={filters.outfitType}
        on:select={onFiltersUpdate}
        on:clear={onFiltersUpdate}
      />
      <Search dense bind:value={filters.phrase} on:search={onFiltersUpdate} />
    </div>
    <PagedList
      {items}
      {pageSizes}
      {loading}
      on:optionsChanged
      let:items={pagedItems}
      let:loading={pagedLoading}
    >
      <OutfitPackagePickerList
        items={pagedItems}
        loading={pagedLoading}
        on:select
      />
    </PagedList>
  </div>
</Dialog>

<style lang="scss">
  #outfit-picker-dialog {
    min-width: 60vw;
    .dialog-filters {
      display: grid;
      margin-left: auto;
      max-width: 600px;
      grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
      gap: 8px;
      margin-bottom: 8px;
    }
  }
</style>
