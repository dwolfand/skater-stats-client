import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === "production" ? "/skater-stats/" : "/",
  server: {
    port: 3000,
    open: true,
    cors: true,
  },
}));
