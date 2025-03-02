<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //consts
  import { OUTFIT_TYPE_ARRAY } from "$src/data/consts/outfit";
  import { COLORS_ARRAY } from "$src/data/consts/color";
  import { MODEL_TYPE } from "$src/data/enums/model";
  //services
  import { ConvertFileToFileData, ImportImages } from "$src/data/import";
  //models
  import type { OutfitLayer } from "$data/models/package";
  //components
  import Button from "../base/Button/Button.svelte";
  import Dialog from "../base/Dialog/Dialog.svelte";
  import SectionTitle from "../base/SectionTitle/SectionTitle.svelte";
  import Select from "../base/Select/Select.svelte";
  import TextBox from "../base/TextBox/TextBox.svelte";
  import DragAndDrop from "../draganddrop/DragAndDrop/DragAndDrop.svelte";
  import OutfitPackageRender from "../render/OutfitPackageRender.svelte";
  import ColorSelect from "../other/ColorSelect/ColorSelect.svelte";
  //icons
  import ImportPackageIcon from "$icons/upload.svg?raw";

  const dispatch = createEventDispatcher();

  export let open = false;
  export let item: OutfitLayer;
  export let onlyTextures = false;

  const onEdit = () => {
    dispatch("edit", { item: item });
  };

  const onDrop = async function (e, model) {
    const droppped = e.detail.items[0];
    item[model] = await ConvertFileToFileData(droppped);
    onEdit();
  };
  const onUpload = async function (e, model) {
    const layers = await ImportImages();
    item[model] = layers[0][model];
    onEdit();
  };
</script>

<Dialog bind:open label="Edit layer">
  <div class="editItemDialog">
    {#if !onlyTextures}
      <SectionTitle label="Name" />
      <TextBox bind:value={item.name} on:input={onEdit} />
      <SectionTitle label="Outfit type" />
      <Select
        items={OUTFIT_TYPE_ARRAY}
        bind:selectedItem={item.outfitType}
        itemText="normalizedName"
        itemValue="name"
        on:select={onEdit}
      />
      <SectionTitle label="color" />
      <ColorSelect
        items={COLORS_ARRAY}
        bind:selectedItem={item.colorName}
        itemText="normalizedName"
        itemValue="name"
        dropDownStyle="max-height: 275px"
        on:select={onEdit}
      />
    {/if}
    <div class="textures">
      <div class="model-selection">
        <SectionTitle label="Classic" />
        <div class="render">
          <DragAndDrop on:drop={(e) => onDrop(e, MODEL_TYPE.STEVE)}>
            <OutfitPackageRender
              resizable
              source={item.steve.content}
              outfitType={item.outfitType}
              model={MODEL_TYPE.STEVE}
            />
          </DragAndDrop>
        </div>
        <div>
          <Button
            icon={ImportPackageIcon}
            label="Upload image"
            on:click={(e) => onUpload(e, MODEL_TYPE.STEVE)}
          />
        </div>
      </div>
      <div class="model-selection">
        <SectionTitle label="Slim" />
        <div class="render">
          <DragAndDrop on:drop={(e) => onDrop(e, MODEL_TYPE.ALEX)}>
            <OutfitPackageRender
              resizable
              source={item.alex.content}
              outfitType={item.outfitType}
              model={MODEL_TYPE.ALEX}
            />
          </DragAndDrop>
        </div>
        <div>
          <Button
            icon={ImportPackageIcon}
            label="Upload image"
            on:click={(e) => onUpload(e, MODEL_TYPE.ALEX)}
          />
        </div>
      </div>
    </div>
  </div>
</Dialog>

<style lang="scss">
  .editItemDialog {
    width: calc(75vh - 120px);
    max-width: 100%;
    .textures {
      margin-top: 8px;
      display: flex;
      flex-direction: row;
      gap: 8px;
      .model-selection {
        flex-direction: column;
        flex: 1;
        display: flex;
        text-align: center;
        .render {
          padding: 4px;
          box-sizing: border-box;
          display: flex;
          aspect-ratio: 1;
          overflow: hidden;
          background-color: var(--color-theme-D1);
          margin-bottom: 8px;
        }
      }
    }
  }
</style>
