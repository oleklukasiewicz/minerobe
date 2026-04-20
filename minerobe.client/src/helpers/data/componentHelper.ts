export function clickOutside(
  node: HTMLElement,
  onOutside?: (event: MouseEvent) => void
): { destroy: () => void } {
  const handleClick = (event: MouseEvent) => {
    if (!node.contains(event.target as Node) && !event.defaultPrevented) {
      onOutside?.(event);
      node.dispatchEvent(new CustomEvent('click_outside', { detail: node }));
    }
  };

  document.addEventListener('click', handleClick, true);
  
  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    },
  };
}