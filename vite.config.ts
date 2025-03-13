import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use different GA IDs based on mode
  console.log("mode", mode);
  const gaId = mode === "production" ? "G-VPFZ5HFC98" : "G-DEVELOPMENT";

  // Generate a timestamp for cache busting
  const timestamp = new Date().getTime();

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
          // Add version to all script and link tags
          html = html.replace(/%ENV_GOOGLE_ANALYTICS%/g, gaScript);
          html = html.replace(
            /<script type="module" src="([^"]+)"/g,
            `<script type="module" src="$1?v=${timestamp}"`
          );
          html = html.replace(/<link[^>]* href="([^"]+)"/g, (match, p1) =>
            match.replace(p1, `${p1}?v=${timestamp}`)
          );
          return html;
        },
      },
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "logo192.png", "logo512.png"],
        strategies: "injectManifest",
        srcDir: "src",
        filename: "sw.js",
        manifest: {
          name: "Skater Stats",
          short_name: "Skater Stats",
          description: "Figure Skating Statistics and Results",
          theme_color: "#2B6CB0",
          background_color: "#ffffff",
          display: "standalone",
          icons: [
            {
              src: "favicon.ico",
              sizes: "64x64 32x32 24x24 16x16",
              type: "image/x-icon",
            },
            {
              src: "logo192.png",
              type: "image/png",
              sizes: "192x192",
            },
            {
              src: "logo512.png",
              type: "image/png",
              sizes: "512x512",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/skater-stats\.com\/$/,
              handler: "NetworkFirst",
              options: {
                cacheName: "start-url",
                expiration: {
                  maxAgeSeconds: 60 * 5, // Cache for 5 minutes max
                },
              },
            },
            {
              urlPattern: /\.(?:js|css)$/,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "static-resources",
              },
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
        output: {
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
        },
      },
    },
  };
});
