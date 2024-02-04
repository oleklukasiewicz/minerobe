<script lang="ts">
  import { _ } from "svelte-i18n";
  import {
    planksTexture,
    userSettings,
    alexModel,
    steveModel,
    showToast,
  } from "$src/data/cache";
  import { mergeImages } from "$src/data/imageMerger";
  import { ImportImage } from "$src/helpers/imageOperationsHelper";
  import { createEventDispatcher, onMount } from "svelte";
  import DynamicRender from "../render/DynamicRender.svelte";
  import { MODEL_TYPE } from "$src/data/consts";
  import DefaultAnimation from "$src/animation/default";
  import SectionTitle from "../base/SectionTitle/SectionTitle.svelte";
  import ModelSelection from "../outfit/ModelSelection/ModelSelection.svelte";
  import CloseIcon from "$icons/close.svg?raw";
  import ImportPackageIcon from "$icons/upload.svg?raw";
  import Button from "../base/Button/Button.svelte";

  const dispatch = createEventDispatcher();

  let texture = $planksTexture;
  const importBaseImage = async () => {
    const filedata = await ImportImage();
    if (filedata) {
      userSettings.update((v) => {
        v.baseTexture = filedata[0].content;
        showToast("Base texture changed");
        return v;
      });
    }
  };
  const resetImage = () => {
    userSettings.update((v) => {
      v.baseTexture = null;
      return v;
    });
  };
  onMount(async () => {
    userSettings.subscribe(async (v) => {
      if (v.baseTexture) {
        texture = await mergeImages(
          [$planksTexture, v.baseTexture],
          undefined,
          v.model
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
      {texture}
      model={$userSettings.model == MODEL_TYPE.ALEX ? $alexModel : $steveModel}
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
    <Button label="Set texture" style="flex:0;" on:click={onSetTexture}/>
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
  .actions {
    display: flex;
    flex-direction: row;
    gap: 8px;
    button {
      width: 100%;
    }
  }
</style>
