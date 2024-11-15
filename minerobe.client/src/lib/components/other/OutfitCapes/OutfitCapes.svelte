<script lang="ts">
  import CloseBoxIcon from "$icons/close-box.svg?raw";
  import InfoLabel from "$lib/components/base/InfoLabel/InfoLabel.svelte";
  import ItemCape from "$lib/components/outfit/ItemCape/ItemCape.svelte";
  import type { Cape } from "$src/model/integration/minecraft";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let capes: Cape[] = [];
  export let selectedCape: Cape = null;

  const onSelect = (cape) => {
    selectedCape = cape;
    dispatch("select", selectedCape);
  };
</script>

{#if capes.length == 0}
  <InfoLabel
    closeable={false}
    type="info"
    description="You have no capes linked to your minecraft account"
  />
{:else}
  <div class="horizontal-list">
    {#each capes as cape}
      <ItemCape
        item={cape}
        on:click={() => onSelect(cape)}
        selected={selectedCape?.id == cape.id}
      />
    {/each}
    <ItemCape on:click={() => onSelect(null)} selected={selectedCape?.id == null}
      ><div style="margin:12px;">
        {@html CloseBoxIcon}
      </div></ItemCape
    >
  </div>
{/if}
