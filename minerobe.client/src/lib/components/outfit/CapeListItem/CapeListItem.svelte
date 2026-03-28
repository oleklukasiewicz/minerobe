<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  interface $$Events {
    click: MouseEvent;
  }
  //services
  import { GetImageArea } from "$src/helpers/image/imageDataHelpers";
  //models
  import { Cape } from "$data/models/integration/minecraft";
  //icons
  import CloseBoxIcon from "$icons/close-box.svg?raw";

  interface Props {
    item?: Cape;
    crop?: boolean;
    selected?: boolean;
    readonly?: boolean;
    autoSize?: boolean;
  }

  let {
    item = new Cape(),
    crop = true,
    selected = false,
    readonly = false,
    autoSize = false
  }: Props = $props();

  const normalizeCape = async function (cape: Cape) {
    if (!crop) return cape.texture;
    return await GetImageArea(cape.texture, 1, 0, 10, 10);
  };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_missing_attribute -->
<a
  class="cape-list-item"
  class:selected
  class:autoSize
  title={item.name}
  onclick={bubble('click')}
  class:readonly
  draggable="false"
>
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
