<script lang="ts">
  import Label from "$lib/components/base/Label/Label.svelte";
  import type { OutfitPackageCollection } from "$src/data/common";

  export let item: OutfitPackageCollection;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="outfit-collection-item" on:click>
  <b class="mc-font">
    {item.name}
  </b>
  <div class="data">
    <div class="labels">
      {#if item.isShared}
        <Label variant="rare" text="Shared" />
      {/if}
    </div>
    <div class="mc-font">
      {item.itemsCount}
    </div>
  </div>
</div>

<style lang="scss">
  @import "OutfitPackageCollectionItem.scss";
</style>
