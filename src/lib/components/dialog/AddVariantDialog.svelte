<script lang="ts">
  import { _ } from "svelte-i18n";
  import { defaultRenderer } from "$data/cache";
  import OutfitTextureRender from "../render/OutfitTextureRender.svelte";
  import SectionTitle from "../base/SectionTitle/SectionTitle.svelte";
  import { CreateDefaultRenderProvider } from "$src/data/render";
  import { MODEL_TYPE } from "$src/data/consts";
  import type { OutfitLayer } from "$src/data/common";
  import { onMount } from "svelte";
  import Button from "../base/Button/Button.svelte";

  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let layer: OutfitLayer;

  let providers = null;
  onMount(async () => {
    providers = await CreateDefaultRenderProvider($defaultRenderer);
  });
  const uploadVariant = function (modelName: string) {
    dispatch("uploadVariant", { modelName: modelName });
  };
</script>

<div class="add-variant-dialog">
  {#if providers != null && layer != null}
    <div class="variant-selection">
      <SectionTitle label={$_("modelOpt.alex")} />
      <div>
        <OutfitTextureRender
          texture={layer?.alex.content}
          modelName={MODEL_TYPE.ALEX}
          type={layer?.alex.type}
          renderProvider={providers?.alex}
        />
      </div>
      <Button label="Upload image" on:click={()=>uploadVariant(MODEL_TYPE.ALEX)} />
    </div>
    <div class="variant-selection">
      <SectionTitle label={$_("modelOpt.steve")} />
      <div>
        <OutfitTextureRender
          texture={layer?.steve.content}
          modelName={MODEL_TYPE.STEVE}
          type={layer?.steve.type}
          renderProvider={providers?.steve}
        />
      </div>
      <Button label="Upload image" on:click={()=>uploadVariant(MODEL_TYPE.STEVE)} />
    </div>
  {/if}
</div>

<style lang="scss">
  .add-variant-dialog {
    display: flex;
    gap: 8px;
    min-width: 65vw;
    flex-direction: row;
    align-items: center;
    padding: 8px;
    box-sizing: border-box;
    justify-content: center;
    .variant-selection {
      flex: 1;
      display: flex;
      gap:8px;
      flex-direction: column;
      text-align: center;
      div {
        aspect-ratio: 1;
        width: 100%;
      }
    }
  }
</style>
