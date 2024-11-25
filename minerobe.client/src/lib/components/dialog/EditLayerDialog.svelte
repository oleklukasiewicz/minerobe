<script lang="ts">
  import { COLORS_ARRAY } from "$src/data/consts";
  import { OUTFIT_TYPE_ARRAY } from "$src/data/consts/data";
  import { MODEL_TYPE } from "$src/data/consts/model";
  import type { OutfitLayer } from "$src/model/package";
  import Button from "../base/Button/Button.svelte";
  import Dialog from "../base/Dialog/Dialog.svelte";
  import SectionTitle from "../base/SectionTitle/SectionTitle.svelte";
  import Select from "../base/Select/Select.svelte";
  import TextBox from "../base/TextBox/TextBox.svelte";
  import DragAndDrop from "../draganddrop/DragAndDrop/DragAndDrop.svelte";
  import OutfitPackageRender from "../render/OutfitPackageRender.svelte";
  export let open = false;
  export let item: OutfitLayer;

  const onEdit = () => {
    console.log(item);
  };
</script>

<Dialog bind:open label="Edit layer">
  <SectionTitle label="Name" />
  <TextBox bind:value={item.name} on:input={onEdit} />
  <SectionTitle label="Outfit type" />
  <Select
    items={OUTFIT_TYPE_ARRAY}
    bind:selectedItem={item.outfitType}
    itemText="normalizedName"
    itemValue="name"
  />
  <SectionTitle label="color" />
  <Select
    items={COLORS_ARRAY}
    bind:selectedItem={item.colorName}
    itemText="normalizedName"
    itemValue="name"
    dropDownStyle="max-height: 275px"
  />
  <div class="textures">
    <div>
      <SectionTitle label="Classic" />
      <div>
        <DragAndDrop>
          <OutfitPackageRender
            resizable
            source={item.steve.content}
            outfitType={item.outfitType}
            model={MODEL_TYPE.STEVE}
          />
        </DragAndDrop>
      </div>
      <Button label="Upload image" />
    </div>
    <div>
      <SectionTitle label="Slim" />
      <div>
        <DragAndDrop>
          <OutfitPackageRender
            resizable
            source={item.alex.content}
            outfitType={item.outfitType}
            model={MODEL_TYPE.ALEX}
          /></DragAndDrop
        >
      </div>
      <Button label="Upload image" />
    </div>
  </div>
</Dialog>

<style lang="scss">
  .textures {
    display: flex;
    flex-direction: row;
    gap: 8px;
    div {
      flex: 1;
      flex-direction: column;
      div {
        max-width: 200px;
        min-width: 13vw;
        background-color: var(--color-theme-D1);
        margin-bottom: 8px;
      }
    }
  }
</style>
