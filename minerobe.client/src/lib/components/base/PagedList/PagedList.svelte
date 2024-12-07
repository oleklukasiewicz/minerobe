<script lang="ts">
  import type { PagedResponse } from "$src/model/base";

  export let items: PagedResponse<any>;
  export let loading: boolean = false;
</script>

<div class="paged-list">
  <div class="list-items">
    <slot {items} {loading}></slot>
  </div>
  <div class="list-actions">test</div>
</div>

<style lang="scss">
</style>
