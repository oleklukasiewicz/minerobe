import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, loadEnv } from "vite";
import dotenv from "dotenv";
import { visualizer } from "rollup-plugin-visualizer";
// Load environment variables from .env
dotenv.config();

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    optimizeDeps: {
      exclude: ["three", "firebase/auth", "signalr"],
    },
    build: {
      rollupOptions: {
        external: ["three", "firebase/auth", "signalr"],
      },
    },
    plugins: [
      sveltekit(),
      visualizer({
        emitFile: true,
        filename: "stats.html",
      }),
    ],
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
