<script lang="ts">
  //components
  import Button from "../Button/Button.svelte";
  //icons
  import ChevronUpIcon from "$icons/chevron-up.svg?raw";
  import ChevronDownIcon from "$icons/chevron-down.svg?raw";

  export let icon = null;
  export let label = null;
  export let group = null;
  export let opened = false;
  export let value = null;

  const toggleExpander = () => {
    if (group == null) {
      opened = !opened;
    } else {
      if (group != value) group = value;
      else group = "none";
    }
  };
</script>

<div class="expander" class:opened={group == null ? opened : group == value}>
  <div class="expander-header">
    <div class="expander-header-data">
      {#if icon}
        <span class="icon-small">
          {@html icon}
        </span>
      {/if}
      {#if label}
        <span class="expander-label">{label}</span>
      {/if}
    </div>
    <span class="expander-toggle">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <Button
        type="quaternary"
        on:click={toggleExpander}
        onlyIcon
        icon={(group == null ? opened : group == value)
          ? ChevronUpIcon
          : ChevronDownIcon}
      />
    </span>
  </div>
  <div class="expander-content">
    <div>
      <slot />
    </div>
  </div>
</div>

<style lang="scss">
  @use "Expander.scss";
</style>
