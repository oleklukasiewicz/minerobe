import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

export default defineConfig({
  plugins: [sveltekit()],
  define: {
    "process.env": import.meta.env,
  },
  server:
  {
    proxy: {
      "/api/": {
        target: "http://localhost:44373/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  }
});
