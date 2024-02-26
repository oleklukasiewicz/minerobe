<script lang="ts">
  import Button from "$lib/components/base/Button/Button.svelte";
  import Label from "$lib/components/base/Label/Label.svelte";
  import type {
    OutfitPackage,
    OutfitPackageCollection,
  } from "$src/data/common";
  import { IsItemInCollection } from "$src/helpers/other/apiHelper";
  import { createEventDispatcher } from "svelte";

  export let item: OutfitPackageCollection;
  export let pack: OutfitPackage;

  const dispatch = createEventDispatcher();

  const onAdd = function () {
    dispatch("add", { collection: item });
  };
  const onRemove = function () {
    dispatch("remove", { collection: item });
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="outfit-collection-item" on:click>
  <div style="display:flex;flex-direction:row; gap:8px;`">
    <b class="mc-font" style="flex:1;margin-top:4px;">
      {item.name}
    </b>
    <div>
      <Button
        label={!IsItemInCollection(item, pack) ? "Add outfit" : "Remove outfit"}
        size="small"
        type={!IsItemInCollection(item, pack) ? "primary" : "tertiary"}
        on:click={() => {
          !IsItemInCollection(item, pack) ? onAdd() : onRemove();
        }}
      />
    </div>
  </div>
  <div class="data">
    <div class="labels">
      {#if item.isShared}
        <Label variant="rare" text="Shared" />
      {/if}
    </div>
    <div class="mc-font">
      {item.outfits.length}
    </div>
  </div>
</div>

<style lang="scss">
  .outfit-collection-item {
    padding: 8px;
    transition: var(--time);
    background-color: var(--color-theme-D1);
    .data {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 8px;
      margin-right: 4px;
      min-height: 26px;
      flex-direction: row;
      .labels {
        flex: 1;
      }
    }
  }
</style>
