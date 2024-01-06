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
  server: {
    proxy: {
      "/mcskinapi": {
        target: "https://api.minecraftservices.com/minecraft/profile/skins",
        secure: false,
        changeOrigin: true,
      },
      "/xboxlive": {
        target: "https://user.auth.xboxlive.com",
        secure: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/xboxlive/, ""),
      },
    },
  },
});
