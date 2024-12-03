<script lang="ts">
  import type { PagedResponse } from "$src/model/base";
  import type { OutfitPackageCollectionWithPackageContext } from "$src/model/collection";
  import Dialog from "../base/Dialog/Dialog.svelte";
  import OutfitPackageCollectionListItem from "../outfit/OutfitPackageCollectionListItem/OutfitPackageCollectionListItem.svelte";

  export let open = false;
  export let label = "Collections";
  export let items: PagedResponse<OutfitPackageCollectionWithPackageContext>;
</script>

<Dialog bind:open {label}>
  <div id="collections-dialog">
    {#each items?.items as item}
      <OutfitPackageCollectionListItem {item} editable />
    {/each}
  </div>
</Dialog>

<style lang="scss">
    #collections-dialog
    {
        display: flex;
        flex-direction: column;
        gap:8px;
    }
</style>
