<script lang="ts">
  import { OUTFIT_TYPE } from "$src/data/consts";
  import { RenderSnapshot, type RenderProvider } from "$src/data/render";
  import OutfitLayerRender from "./OutfitLayerRender.svelte";
  export let texture: string;
  export let modelName = "steve";
  export let type = OUTFIT_TYPE.OUTFIT_SET;
  export let renderProvider: RenderProvider = null;
  export const snapshot: RenderSnapshot = new RenderSnapshot();

  let item;
  $: {
    console.log(type);
    item = {
      steve: {
        content: texture,
        outfitType: type,
      },
      alex: {
        content: texture,
        outfitType: type,
      },
    };
  }
</script>

<div style="aspect-ratio: 1/1;">
  <OutfitLayerRender
    {item}
    modelName={modelName}
    {renderProvider}
    {snapshot}
  />
</div>
