<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //models
  import type { PagedResponse } from "$src/model/base";
  import type { OutfitPackageCollectionWithPackageContext } from "$src/model/collection";
  //components
  import OutfitPackageCollectionListItem from "../outfit/OutfitPackageCollectionListItem/OutfitPackageCollectionListItem.svelte";
  import Dialog from "../base/Dialog/Dialog.svelte";
  import Placeholder from "../base/Placeholder/Placeholder.svelte";

  const dispatch = createEventDispatcher();

  export let open = false;
  export let label = "Collections";
  export let items: PagedResponse<OutfitPackageCollectionWithPackageContext>;
  export let loading = true;

  const onSelect = (item: OutfitPackageCollectionWithPackageContext) => {
    dispatch("select", { item: item });
  };
  const onUnselect = (item: OutfitPackageCollectionWithPackageContext) => {
    dispatch("unselect", { item: item });
  };
</script>

<Dialog bind:open {label}>
  <div id="collections-dialog">
    {#if loading}
      {#each Array(12) as _}
        <Placeholder width="100%" height="50px" />
      {/each}
    {:else}
      {#each items?.items as item}
        <OutfitPackageCollectionListItem
          {item}
          selectable
          on:select={() => onSelect(item)}
          on:unselect={() => onUnselect(item)}
        />
      {/each}
    {/if}
  </div>
</Dialog>

<style lang="scss">
  #collections-dialog {
    display: grid;
    max-width: 600px;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 8px;
  }
</style>
