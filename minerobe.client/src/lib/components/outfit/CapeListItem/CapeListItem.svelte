<script lang="ts">
  import { GetImageArea } from "$src/helpers/image/imageDataHelpers";
  import { Cape } from "$src/model/integration/minecraft";
  import CloseBoxIcon from "$icons/close-box.svg?raw";

  export let item: Cape = new Cape();
  export let crop: boolean = true;
  export let selected: boolean = false;

  const normalizeCape = async function (cape: Cape) {
    if (!crop) return cape.texture;
    return await GetImageArea(cape.texture, 1, 0, 10, 10);
  };
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<a class="cape-list-item" class:selected title={item.name} on:click>
  {#if item.id}
    {#await normalizeCape(item) then texture}
      <img src={texture} alt={item.name} />
    {/await}
  {:else}
    <div>
      {@html CloseBoxIcon}
    </div>
  {/if}
</a>

<style lang="scss">
  @use "CapeListItem.scss";
</style>
