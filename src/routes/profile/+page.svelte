<script lang="ts">
  import Label from "$lib/Label/Label.svelte";
  import ModelSelection from "$lib/ModelSelection/ModelSelection.svelte";
  import SectionTitle from "$lib/SectionTitle/SectionTitle.svelte";
  import DynamicRender from "$lib/render/DynamicRender.svelte";
  import DefaultAnimation from "$src/animation/default";
  import {
    alexModel,
    currentUser,
    defaultRenderer,
    isMobileView,
    isReadyForData,
    steveModel,
    userSettings,
  } from "$src/data/cache";
  import { MODEL_TYPE } from "$src/data/consts";
  import {
    CreateDefaultRenderProvider,
    RenderProvider,
  } from "$src/data/render";
  import { onMount } from "svelte";
  import { propertyStore } from "svelte-writable-derived";

  const userModel = propertyStore(userSettings, "model");

  let providers: { steve: RenderProvider; alex: RenderProvider };

  let loading = true;
  onMount(async () => {
    providers = await CreateDefaultRenderProvider($defaultRenderer);
    isReadyForData.subscribe((v) => {
      if (v.wardrobe) {
        loading = false;
      }
    });
  });
</script>

<div id="profile-view" class:mobile={$isMobileView}>
  <div class="render-area">
    {#if !loading}
      <DynamicRender
        defaultAnimation={DefaultAnimation}
        model={$userModel == MODEL_TYPE.STEVE ? $steveModel : $alexModel}
        texture={$userSettings.baseTexture}
        modelName={$userModel}
      />
      <ModelSelection bind:group={$userModel} />
    {/if}
  </div>
  <div class="data-area">
    <SectionTitle label="Profile" placeholder={loading}/>
    {#if !loading}
    <h1>{$currentUser.name}</h1>
    {/if}
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
