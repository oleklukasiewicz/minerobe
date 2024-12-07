<script lang="ts">
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import type { PagedResponse } from "$src/model/base";
  import type { OutfitPackage } from "$src/model/package";

  export let items: PagedResponse<OutfitPackage>;
  export let loading = true;
</script>

<div id="outfit-package-picker-list">
  {#if loading}
    {#each Array(items?.pageSize || 10) as _}
      <Placeholder width="100%" height="50px" />
    {/each}
  {:else}
    {#each items?.items as item}
      {item.name}
    {/each}
  {/if}
</div>

<style lang="scss">
  #outfit-package-picker-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 8px;
  }
</style>
