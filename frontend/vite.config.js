import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    tanstackStart({
      server: { entry: "src/server.js" },
    }),
    nitro(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5004",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:5004",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
