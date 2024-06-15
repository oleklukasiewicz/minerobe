<script lang="ts">
  import { _ } from "svelte-i18n";
  import { planksTexture } from "$src/data/cache";
  import { ImportSingleImage } from "$src/helpers/data/dataTransferHelper";
  import { createEventDispatcher } from "svelte";
  import DynamicRender from "../render/DynamicRender.svelte";
  import { MODEL_TYPE } from "$src/data/consts";
  import DefaultAnimation from "$src/animation/default";
  import SectionTitle from "../base/SectionTitle/SectionTitle.svelte";
  import ModelSelection from "../outfit/ModelSelection/ModelSelection.svelte";
  import CloseIcon from "$icons/close.svg?raw";
  import ImportPackageIcon from "$icons/upload.svg?raw";
  import Button from "../base/Button/Button.svelte";
  import { ALEX_MODEL, STEVE_MODEL } from "$src/data/consts";
  import { FileData, OutfitLayer, OutfitPackage } from "$src/model/package";

  const dispatch = createEventDispatcher();

  export let baseTexture: OutfitPackage = null;

  let texture = $planksTexture;
  const importBaseImage = async () => {
    const filedata = await ImportSingleImage();
    if (filedata) {
      baseTexture.layers = [
        new OutfitLayer(
          "base",
          new FileData("s_base", filedata.content),
          new FileData("a_base", filedata.content)
        ),
      ];
    }
  };
  const resetImage = () => {
    baseTexture.layers = [];
    baseTexture = { ...baseTexture };
  };
  const onSetTexture = function () {
    dispatch("setTexture", baseTexture);
  };
</script>

<div class="base-texture-dialog">
  <div class="render">
    <DynamicRender
      defaultAnimation={DefaultAnimation}
      texture={baseTexture?.layers?.length > 0
        ? baseTexture?.layers[0][baseTexture.model].content
        : texture}
      model={baseTexture?.model == MODEL_TYPE.ALEX
        ? ALEX_MODEL.model
        : STEVE_MODEL.model}
      modelName={baseTexture?.model == MODEL_TYPE.ALEX
        ? ALEX_MODEL.model
        : STEVE_MODEL.model}
    />
  </div>
  <div class="data">
    <SectionTitle label="model" />
    <ModelSelection bind:group={baseTexture.model} />
    <SectionTitle label="actions" />
    <div class="actions">
      <Button
        label={$_("layersOpt.addLayer")}
        icon={ImportPackageIcon}
        on:click={importBaseImage}
      />
      <Button
        label="Reset"
        type="tertiary"
        on:click={resetImage}
        icon={CloseIcon}
      />
    </div>
    <div style="flex:1;"></div>
    <Button label="Set texture" style="flex:0;" on:click={onSetTexture} />
  </div>
</div>

<style lang="scss">
  .base-texture-dialog {
    width: 100%;
    height: 100%;
    min-width: 65vw;
    display: flex;
    gap: 8px;
    padding: 0px 8px 8px 8px;
    box-sizing: border-box;
    flex-direction: row;
    .render {
      aspect-ratio: 1/1;
      max-height: 100%;
      flex: 2;
    }
    .data {
      flex: 3;
      display: flex;
      flex-direction: column;
    }
  }
</style>
