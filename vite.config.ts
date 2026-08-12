import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? "/root-sovereign-gateway-staging/" : "/",
  server: { port: 5174, allowedHosts: true },
});
