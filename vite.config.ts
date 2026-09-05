import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [{
    name: "e2e-upstream-404",
    configurePreviewServer(server) {
      server.middlewares.use("/__e2e-upstream-404", (_request, response) => {
        response.statusCode = 404;
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.end("<!doctype html><title>Missing</title><h1>Upstream page missing</h1>");
      });
    }
  }],
  build: {
    target: "es2022",
    sourcemap: true
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"]
  }
});
