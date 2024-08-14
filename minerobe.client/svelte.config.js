import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    alias: {
      $lib: "src/lib",
      $src: "src",
      $public: "static",
      $data: "src/data",
      $animation: "src/animation",
      $locales: "src/locales",
      $icons: "src/icons",
      $helpers: "src/helpers",
      $texture: "src/texture",
      $component: "src/lib/components",
      $model: "src/model",
      $api: "src/api",
    },
    serviceWorker: {
      register: false,
    },
  },
};

export default config;
