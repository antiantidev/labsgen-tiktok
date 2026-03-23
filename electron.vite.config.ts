import { defineConfig, externalizeDepsPlugin } from "electron-vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    entry: "src/main/index.ts",
    build: {
      outDir: "dist/main",
      watch: {
        usePolling: true
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    entry: "src/preload/index.ts",
    build: {
      outDir: "dist/preload",
      watch: {
        usePolling: true
      }
    }
  },
  renderer: {
    root: ".",
    plugins: [react()],
    server: {
      watch: {
        usePolling: true
      }
    },
    build: {
      outDir: "dist/renderer",
      rollupOptions: {
        input: "index.html"
      }
    }
  }
})
