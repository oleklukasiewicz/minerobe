<script lang="ts">
  //models
  import type { Cape } from "$data/models/integration/minecraft";

  import CapeListItem from "../CapeListItem/CapeListItem.svelte";

  interface Props {
    items: Cape[];
    selectedCapeId: string;
    readonly?: boolean;
    onselect?: (event?: any) => void;
  }

  let { items, selectedCapeId = $bindable(), readonly = false ,
    onselect = null
  }: Props = $props();

  const onSelect= function (item: Cape) {
    selectedCapeId = item?.id;
    onselect?.({ detail: { item: item } });
  };
</script>

<div class="cape-list">
  {#each items as item}
    <CapeListItem
      {readonly}
      {item}
      selected={item.id === selectedCapeId}
      onclick={() => onSelect(item)}
    />
  {/each}
  {#if !readonly}
    <CapeListItem
      {readonly}
      selected={selectedCapeId === undefined || selectedCapeId === null}
      onclick={() => onSelect(null)}
    />
  {/if}
</div>

<style lang="scss">
  .cape-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
    flex-wrap: wrap;
    gap: 8px;
  }
</style>
