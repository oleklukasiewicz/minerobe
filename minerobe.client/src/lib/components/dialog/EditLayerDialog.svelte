<script lang="ts">
  import { _ } from "svelte-i18n";
  import { defaultRenderer } from "$data/cache";
  import CheckBoxIcon from "$icons/checkbox.svg?raw";
  import CheckBoxOffIcon from "$icons/checkbox-off.svg?raw";
  import SectionTitle from "../base/SectionTitle/SectionTitle.svelte";
  import { CreateDefaultRenderProvider } from "$src/data/render";
  import {
    COLORS_ARRAY,
    MODEL_TYPE,
    OUTFIT_TYPE_ARRAY,
  } from "$src/data/consts";
  import { onMount } from "svelte";
  import Button from "../base/Button/Button.svelte";

  import { createEventDispatcher } from "svelte";
  import type { OutfitLayer } from "$src/model/package";
  import OutfitLayerRender from "../render/OutfitLayerRender.svelte";
  import TextBox from "../base/TextBox/TextBox.svelte";
  import Select from "../base/Select/Select.svelte";
  import ColorBadge from "../other/ColorBadge/ColorBadge.svelte";
  import { ConvertToStringColor } from "$src/helpers/image/colorHelper";

  const dispatch = createEventDispatcher();

  export let layer: OutfitLayer;

  let providers = null;
  onMount(async () => {
    providers = await CreateDefaultRenderProvider($defaultRenderer);
  });
  const uploadVariant = function (modelName: string) {
    dispatch("uploadVariant", { modelName: modelName });
  };
  const editLayer = function () {
    dispatch("edit", { layer: layer });
  };
</script>

<div class="add-variant-dialog">
  <div class="layer-data">
    <SectionTitle label="name" />
    <TextBox bind:value={layer.name} clearable on:input={editLayer} />
    <SectionTitle label="outfit type" />
    <Select
      items={OUTFIT_TYPE_ARRAY}
      bind:selectedItem={layer.outfitType}
      itemText="normalizedName"
      itemValue="name"
      on:select={editLayer}
    />
    <SectionTitle label="color" />
    <Select
      sorter={(a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      }}
      on:select={editLayer}
      items={COLORS_ARRAY}
      dropDownStyle="max-height: 250px"
      placeholder="Color"
      clearable
      bind:selectedItem={layer.colorName}
      itemText="normalizedName"
      itemValue="name"
      let:item
      let:itemText
      let:selectedItemValue
    >
      <Button
        textAlign="left"
        size="small"
        noBorder
        flat
        icon={selectedItemValue == item ? CheckBoxIcon : CheckBoxOffIcon}
        type={selectedItemValue == item ? "primary" : "quaternary"}
      >
        <div
          style="display: inline-flex;gap:4px;
max-width: calc(100% - 40px);transform:translateY(-5px)"
        >
          <ColorBadge
            small
            colorName={item}
            color={ConvertToStringColor(item)}
          />
          <div
            style="white-space: nowrap;display:block;text-overflow: ellipsis;
overflow: hidden;"
          >
            {item[itemText]}
          </div>
        </div>
      </Button>
    </Select>
  </div>
  <div class="layer-render">
    {#if providers != null}
      <div class="variant-selection">
        <SectionTitle label={$_("modelOpt.alex")} />
        <div class="render">
          <OutfitLayerRender
            item={layer}
            modelName={MODEL_TYPE.ALEX}
            renderProvider={providers?.alex}
          />
        </div>
        <Button
          label="Upload image"
          style="width:100%"
          on:click={() => uploadVariant(MODEL_TYPE.ALEX)}
        />
      </div>
      <div class="variant-selection">
        <SectionTitle label={$_("modelOpt.steve")} />
        <div class="render">
          <OutfitLayerRender
            item={layer}
            modelName={MODEL_TYPE.STEVE}
            renderProvider={providers?.steve}
          />
        </div>
        <Button
          label="Upload image"
          style="width:100%"
          on:click={() => uploadVariant(MODEL_TYPE.STEVE)}
        />
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .add-variant-dialog {
    margin: 16px;
    .layer-render {
      display: flex;
      margin-top: 4px;
      flex-direction: row;
      gap: 8px;
      .variant-selection {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        .render {
          aspect-ratio: 1/1;
          max-width: 200px;
          background-color: var(--color-theme-D1);
        }
      }
    }
  }
</style>
