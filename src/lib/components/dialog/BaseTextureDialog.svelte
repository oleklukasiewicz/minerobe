<script lang="ts">
  import { _ } from "svelte-i18n";
  import { planksTexture, userSettings, showToast, baseTexture } from "$src/data/cache";
  import { MergeStringToImage } from "$src/data/imageMerger";
  import { ImportImage } from "$src/helpers/data/dataTransferHelper";
  import { createEventDispatcher, onMount } from "svelte";
  import DynamicRender from "../render/DynamicRender.svelte";
  import { MODEL_TYPE } from "$src/data/consts";
  import DefaultAnimation from "$src/animation/default";
  import SectionTitle from "../base/SectionTitle/SectionTitle.svelte";
  import ModelSelection from "../outfit/ModelSelection/ModelSelection.svelte";
  import CloseIcon from "$icons/close.svg?raw";
  import ImportPackageIcon from "$icons/upload.svg?raw";
  import Button from "../base/Button/Button.svelte";
  import { OutfitPackageRenderConfig } from "$src/data/model";
  import { ALEX_MODEL, STEVE_MODEL } from "$src/data/consts";
  import { FileData, OutfitLayer } from "$src/data/common";
  import { text } from "@sveltejs/kit";

  const dispatch = createEventDispatcher();

  let texture = $planksTexture;
  const importBaseImage = async () => {
    const filedata = await ImportImage();
    if (filedata) {
      userSettings.update((v) => {
        const layer = v.baseTexture as OutfitLayer;
        layer[v.model].content = filedata[0].content;
        showToast("Base texture changed");
        return v;
      });
    }
  };
  const resetImage = () => {
    userSettings.update((v) => {
      v.baseTexture = new OutfitLayer("base",new FileData("s_base",null),new FileData("a_base",null));
      return v;
    });
  };
  onMount(async () => {
    userSettings.subscribe(async (v) => {
      if (v.baseTexture) {
        const config = new OutfitPackageRenderConfig();
        config.model = v.model == MODEL_TYPE.ALEX ? ALEX_MODEL : STEVE_MODEL;
        texture = await MergeStringToImage(
          [$planksTexture, v.baseTexture[v.model].content].filter((v) => v),
          config
        );
      } else texture = $planksTexture;
    });
  });

  const onSetTexture = function () {
    dispatch("setTexture", texture);
  };
</script>

<div class="base-texture-dialog">
  <div class="render">
    <DynamicRender
      defaultAnimation={DefaultAnimation}
      texture={$userSettings.baseTexture[$userSettings.model].content || texture}
      model={$userSettings.model == MODEL_TYPE.ALEX
        ? ALEX_MODEL.model
        : STEVE_MODEL.model}
      modelName={$userSettings.model}
    />
  </div>
  <div class="data">
    <SectionTitle label="model" />
    <ModelSelection bind:group={$userSettings.model} />
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
