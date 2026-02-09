const { defineConfig, externalizeDepsPlugin } = require("electron-vite");
const react = require("@vitejs/plugin-react");

module.exports = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    entry: "src/main/index.js",
    build: {
      outDir: "dist/main"
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    entry: "src/preload/index.js",
    build: {
      outDir: "dist/preload"
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
