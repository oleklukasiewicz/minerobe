<script lang="ts">
  import type { OutfitPackageCollection } from "$src/data/models/collection";
  import { createEventDispatcher } from "svelte";
  import Button from "../base/Button/Button.svelte";
  import Dialog from "../base/Dialog/Dialog.svelte";
  import SectionTitle from "../base/SectionTitle/SectionTitle.svelte";
  import TextBox from "../base/TextBox/TextBox.svelte";
  import Checkbox from "../base/Checkbox/Checkbox.svelte";

  export let open = false;
  export let label = "Edit Collection";
  export let collection: OutfitPackageCollection = null;

  const dispatch = createEventDispatcher();

  const handleSave = () => {
    dispatch("save", { collection });
    open = false;
  };
</script>

<Dialog bind:open {label}>
  <div id="edit-collection-dialog">
    <div>
      <SectionTitle label="name" />
      <TextBox placeholder="Collection Name" bind:value={collection.name} />
    </div>
    <div>
      <SectionTitle label="description" />
      <textarea placeholder="Description" bind:value={collection.description}
      ></textarea>
    </div>
    <Checkbox label="Is Shared" bind:value={collection.social.isShared} />
    <div id="actions">
      <Button label="Save" on:click={handleSave} />
    </div>
  </div>
</Dialog>

<style lang="scss">
  #edit-collection-dialog {
    display: flex;
    flex-direction: column;
    gap: 8px;
    div {
      display: flex;
      flex-direction: column;
    }
    #actions {
      display: block;
      margin-top: 8px;
    }
  }
</style>
