import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // to be accessible on local network
    port: 5173, // you can change the port
    proxy: {
      // all requests started from /api send to FastAPI
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
