<script lang="ts">
  //models
  import type { PagedResponse } from "$data/models/base";

  //icons
  import ChevronLeftIcon from "$icons/chevron-left.svg?raw";
  import ChevronRightIcon from "$icons/chevron-right.svg?raw";

  //main imports
    //models
  //components
  import Button from "../../base/Button/Button.svelte";
  import Select from "../../base/Select/Select.svelte";
  //icons

  interface PagedListProps {
    items: PagedResponse<any>;
    pageSize?: any;
    loading?: boolean;
    pageSizes?: number[];
    children?: import('svelte').Snippet<[any]>;
    footer?: import('svelte').Snippet;
    onoptionsChanged?: (event?: any) => void;
  }

  let {
    items = $bindable(),
    pageSize = null,
    loading = false,
    pageSizes = [10, 20, 50, 100],
    children,
    footer
  ,
    onoptionsChanged = null
  }: PagedListProps = $props();

  let selectedPageSize = $state(0);
  const totalPages = $derived.by(() => {
    const total = items?.options.total ?? 0;
    return selectedPageSize > 0 ? Math.ceil(total / selectedPageSize) : 0;
  });

  $effect(() => {
    if (selectedPageSize !== 0) return;
    selectedPageSize = pageSize ?? items?.options.pageSize ?? 0;
  });

  $effect(() => {
    if (items?.options.pageSize != null && items.options.pageSize !== selectedPageSize) {
      selectedPageSize = items.options.pageSize;
    }
  });

  const onOptionsChanged= function () {
    onoptionsChanged?.({ options: items });
  };
  const onPrevious= function (event) {
    items = {
      ...items,
      options: {
        ...items.options,
        page: Math.max(0, (items?.options.page ?? 0) - 1),
      },
    };
    onOptionsChanged();
  };
  const onNext= function (event) {
    items = {
      ...items,
      options: {
        ...items.options,
        page: (items?.options.page ?? 0) + 1,
      },
    };
    onOptionsChanged();
  };
  const onPageSizeChanged= function (event) {
    const pageSize = event.item;
    selectedPageSize = pageSize;
    const nextPage =
      (items?.options.page ?? 0) >=
      Math.ceil((items?.options.total ?? 0) / (pageSize || 1))
        ? 0
        : items?.options.page ?? 0;

    items = {
      ...items,
      options: {
        ...items.options,
        pageSize,
        page: nextPage,
      },
    };
    onOptionsChanged();
  };
</script>

<div class="paged-list">
  <div class="list-items">
    {@render children?.({ items: items?.items, pageSize: selectedPageSize, page: items.options.page, loading, })}
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
        onclick={onPrevious}
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
        onclick={onNext}
      />
      <div>
        <Select
          disabled={loading}
          items={pageSizes}
          value={selectedPageSize}
          onselect={onPageSizeChanged}
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
