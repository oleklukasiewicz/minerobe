<script lang="ts">
  import Dialog from "../base/Dialog/Dialog.svelte";
  import PagedList from "../base/PagedList/PagedList.svelte";
  import OutfitPackagePickerList from "../outfit/OutfitPackagePickerList/OutfitPackagePickerList.svelte";

  export let items;
  export let pageSizes = [5, 10, 15, 20];
  export let open = false;
  export let label = "Outfit Picker";
  export let loading = true;
</script>

<Dialog bind:open {label}>
  <div id="outfit-picker-dialog">
    <PagedList
      {items}
      {pageSizes}
      {loading}
      on:optionsChanged
      let:items={pagedItems}
      let:loading={pagedLoading}
    >
      <OutfitPackagePickerList items={pagedItems} loading={pagedLoading} />
    </PagedList>
  </div>
</Dialog>

<style lang="scss">
  #outfit-picker-dialog {
    min-width: 50vw;
    max-width: 600px;
  }
</style>
