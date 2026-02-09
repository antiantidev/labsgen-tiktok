const { defineConfig, externalizeDepsPlugin } = require("electron-vite");
const react = require("@vitejs/plugin-react");

module.exports = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    entry: "src/main/index.js",
    build: {
      outDir: "dist/main",
      watch: {
        usePolling: true
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    entry: "src/preload/index.js",
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
          usePolling: true,
        },
      },
      build: {      outDir: "dist/renderer",
      rollupOptions: {
        input: "index.html"
      }
    }
  }
});
