import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: "/",
  server: {
    port: 3000,
    open: true,
    cors: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        404: "./public/404.html",
      },
    },
  },
}));
