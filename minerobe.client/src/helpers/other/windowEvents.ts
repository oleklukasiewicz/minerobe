function createWindowEventStore(event) {
  const subs = [];
  let listener = false;

  function on() {
    for (const cb of subs) {
      cb();
    }
  }

  return {
    subscribe(cb) {
      subs.push(cb);

      if (!listener) {
        window.addEventListener(event, on);
        listener = true;
      }

      return () => {
        const index = subs.findIndex((fn) => fn === cb);
        subs.splice(index, 1);

        if (subs.length < 1) {
          window.removeEventListener(event, on);
          listener = false;
        }
      };
    },
  };
}

export const WindowResizeEvent = createWindowEventStore("resize");
