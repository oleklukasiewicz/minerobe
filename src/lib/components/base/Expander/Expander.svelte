<script lang="ts">
  export let icon = null;
  export let label = null;
  export let group = null;
  export let opened = false;
  export let value = null;

  import ChevronUpIcon from "$icons/chevron-up.svg?raw";
  import ChevronDownIcon from "$icons/chevron-down.svg?raw";

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
      <button class="icon icon-small tertiary" on:click={toggleExpander}>
        {@html (group == null ? opened : group == value) ? ChevronUpIcon : ChevronDownIcon}
      </button>
    </span>
  </div>
  <div class="expander-content">
    <div>
      <slot />
    </div>
  </div>
</div>

<style lang="scss">
  @import "Expander.scss";
</style>
