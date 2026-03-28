<script lang="ts">
  import { run } from 'svelte/legacy';

  //main imports
  import { createEventDispatcher } from "svelte";
  //models
  import type { PagedResponse } from "$data/models/base";
  //components
  import Button from "../../base/Button/Button.svelte";
  import Select from "../../base/Select/Select.svelte";
  //icons
  import ChevronLeftIcon from "$icons/chevron-left.svg?raw";
  import ChevronRightIcon from "$icons/chevron-right.svg?raw";

  const dispatch = createEventDispatcher();

  interface Props {
    items: PagedResponse<any>;
    pageSize?: any;
    loading?: boolean;
    pageSizes?: number[];
    children?: import('svelte').Snippet<[any]>;
    footer?: import('svelte').Snippet;
  }

  let {
    items = $bindable(),
    pageSize = null,
    loading = false,
    pageSizes = [10, 20, 50, 100],
    children,
    footer
  }: Props = $props();

  let totalPages = $state(0);
  run(() => {
    totalPages = Math.ceil(
      items?.options.total / (pageSize ?? items?.options.pageSize)
    );
  });

  const onOptionsChanged= function () {
    dispatch("optionsChanged", { options: items });
  };
  const onPrevious= function (event) {
    items.options.page--;
    onOptionsChanged();
  };
  const onNext= function (event) {
    items.options.page++;
    onOptionsChanged();
  };
  const onPageSizeChanged= function (event) {
    const pageSize = event.detail.item;
    items.options.pageSize = pageSize;
    //check if the current page is valid
    if (
      items.options.page >=
      Math.ceil(items?.options.total / (pageSize ?? items?.options.pageSize))
    ) {
      items.options.page = 0;
    }
    onOptionsChanged();
  };
</script>

<div class="paged-list">
  <div class="list-items">
    {@render children?.({ items: items?.items, pageSize: pageSize ?? items?.options.pageSize, page: items.options.page, loading, })}
  </div>
  <div class="list-actions">
    <div>
      {@render footer?.()}
    </div>
    <div class="footer-actions">
      <Button
        label="Previous"
        onlyIcon
        iconSize="large"
        icon={ChevronLeftIcon}
        disabled={items?.options.page == 0 || items == null || loading}
        on:click={onPrevious}
      />
      <div class="page">
        {items?.options.page + 1 || 0} of {totalPages || 0}
      </div>
      <Button
        label="Next"
        onlyIcon
        icon={ChevronRightIcon}
        iconSize="large"
        disabled={items?.options.page >= totalPages - 1 ||
          items == null ||
          loading}
        on:click={onNext}
      />
      <div>
        <Select
          disabled={loading}
          items={pageSizes}
          selectedItem={pageSize ?? items?.options.pageSize}
          on:select={onPageSizeChanged}
        />
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .paged-list {
    flex: 1;
    display: grid;
    grid-template-rows: 1fr auto;
    min-height: 0px;
  }
  .list-items {
    overflow: auto;
    display: block;
    min-height: 0px;
  }
  .list-actions {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    justify-content: end;
    margin-top: 8px;
    height: 36px;
    .footer-actions {
      display: flex;
      gap: 8px;
      flex-direction: row;
      .page {
        margin-top: 12px;
        text-align: center;
        min-width: 60px;
        font-family: minecraft-simple;
        font-size: var(--size-font-caption);
        user-select: none;
      }
    }
  }
</style>
