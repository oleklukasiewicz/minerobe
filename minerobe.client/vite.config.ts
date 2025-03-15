import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, loadEnv } from "vite";
import dotenv from "dotenv";
import { threeMinifier } from "@yushijinhun/three-minifier-rollup";

// Load environment variables from .env
dotenv.config();

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [{ ...threeMinifier(), enforce: "pre" }, sveltekit()],
    define: {
      "process.env": import.meta.env,
    },
    server: {
      proxy: {
        "/api/": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
