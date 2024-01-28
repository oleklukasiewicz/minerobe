<script lang="ts">
  import Button from "../Button/Button.svelte";

  export let value = null;
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
    <Button
      label={v.label}
      icon={v.icon}
      type={v.value === value ? "primary" : "secondary"}
      on:click={() => {
        value = v.value;
      }}
    />
  {/each}
</div>

<style lang="scss">
  .ratio-group {
    display: flex;
    flex-direction: row;
  }
</style>
