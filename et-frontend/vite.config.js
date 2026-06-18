import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // The Three.js globe is loaded only when its landing-page section is needed.
    chunkSizeWarningLimit: 800,
  },
});
