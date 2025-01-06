import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Get the repository name from package.json or environment variable
const base =
  process.env.NODE_ENV === "production" ? "/skater-stats-client/" : "/";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base,
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
