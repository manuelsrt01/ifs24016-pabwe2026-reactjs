import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Sisipkan CSS hasil build ke <style> di index.html agar tidak ada stylesheet yang memblokir render.
const inlineCss = () => ({
  name: "inline-css",
  apply: "build",
  enforce: "post",
  transformIndexHtml: {
    order: "post",
    handler(html, ctx) {
      const bundle = ctx?.bundle;
      if (!bundle) return html;
      return html.replace(/<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/g, (tag, href) => {
        const asset = bundle[href.replace(/^\//, "")];
        if (!asset || asset.type !== "asset") return tag;
        const css = String(asset.source).replace(/<\/style/gi, "<\\/style");
        return `<style>${css}</style>`;
      });
    },
  },
});

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss(), inlineCss()],
  server: { port: 3000 },
  // Build produksi memanggil API lewat domain sendiri (/api/v1), lalu Vercel meneruskannya ke Delcom (lihat vercel.json).
  // Ini menghindari warning Chrome "deprecated Authorization header" akibat CORS wildcard dari server Delcom.
  define: command === "build" ? { "import.meta.env.VITE_API_BASE_URL": JSON.stringify("/api/v1") } : {},
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    css: false,
    env: { VITE_API_BASE_URL: "https://open-api.delcom.org/api/v1" },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/main.jsx", "src/setupTests.js", "src/test-utils.jsx", "src/**/*.test.{js,jsx}"],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
}));