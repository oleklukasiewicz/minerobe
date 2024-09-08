<script lang="ts">
  import RatioButton from "../RatioButton/RatioButton.svelte";

  export let value = null;
  export let size: "small" | "medium" | "large" = "medium";
  export let values = [];
  let normalizedValues = [];
  const normalizeValues = function (vals) {
    normalizedValues = vals.map((v, i) => {
      if (typeof v === "string") {
        return { value: v, label: v };
      } else if (typeof v === "object") {
        return v;
      } else {
        throw new Error("Invalid value type");
      }
    });
  };
  $: normalizeValues(values);
</script>

<div class="ratio-group">
  {#each normalizedValues as v (v.value)}
    <RatioButton
      label={v.label}
      {size}
      icon={v.icon}
      selected={v.value.toLowerCase() === value.toLowerCase()}
      on:click={() => {
        value = v.value;
      }}
    />
  {/each}
</div>

<style lang="scss">
  .ratio-group {
    flex: 1;
    text-align: center;
    display: flex;
    box-sizing: border-box;
    flex-direction: row;
  }
</style>
