import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { copyFileSync } from "fs";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use different GA IDs based on mode
  console.log("mode", mode);
  const gaId = mode === "production" ? "G-VPFZ5HFC98" : "G-DEVELOPMENT";

  // Only include GA script if ID is provided
  const gaScript = gaId
    ? `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    </script>
  `
    : "";

  return {
    plugins: [
      react(),
      {
        name: "html-transform",
        transformIndexHtml(html) {
          return html.replace("%ENV_GOOGLE_ANALYTICS%", gaScript);
        },
      },
      // Copy _headers file to build directory
      {
        name: "copy-files",
        closeBundle() {
          try {
            copyFileSync(
              resolve(__dirname, "public/_headers"),
              resolve(__dirname, "dist/_headers")
            );
            console.log("_headers file copied to build output");
          } catch (error) {
            console.error("Error copying _headers file:", error);
          }
        },
      },
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "favicon.ico?v=2",
          "favicon-16x16.png?v=2",
          "favicon-32x32.png?v=2",
          "apple-touch-icon.png?v=2",
          "logo192.png?v=2",
          "logo512.png?v=2",
        ],
        manifest: {
          name: "Skater Stats",
          short_name: "Skater Stats",
          description: "See your past scores and get live updates",
          theme_color: "#2B6CB0",
          background_color: "#ffffff",
          display: "standalone",
          icons: [
            {
              src: "favicon.ico?v=2",
              sizes: "64x64 32x32 24x24 16x16",
              type: "image/x-icon",
            },
            {
              src: "favicon-16x16.png?v=2",
              sizes: "16x16",
              type: "image/png",
            },
            {
              src: "favicon-32x32.png?v=2",
              sizes: "32x32",
              type: "image/png",
            },
            {
              src: "apple-touch-icon.png?v=2",
              sizes: "180x180",
              type: "image/png",
              purpose: "apple touch icon",
            },
            {
              src: "logo192.png?v=2",
              type: "image/png",
              sizes: "192x192",
            },
            {
              src: "logo512.png?v=2",
              type: "image/png",
              sizes: "512x512",
            },
          ],
        },
      }),
    ],
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
  };
});
