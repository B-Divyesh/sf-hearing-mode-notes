import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const fromRoot = (file: string) => resolve(process.cwd(), file);

describe("release asset and response-policy contract", () => {
  test("the service-worker shell only precaches an authored favicon", async () => {
    const [icon, worker, page] = await Promise.all([
      readFile(fromRoot("public/icon.svg"), "utf8"),
      readFile(fromRoot("public/sw.js"), "utf8"),
      readFile(fromRoot("index.html"), "utf8")
    ]);

    expect(icon).toContain("<svg");
    expect(worker).toContain('"/icon.svg"');
    expect(page).toContain('href="/icon.svg"');
  });

  test("static deployment config protects and caches the right resources", async () => {
    const headers = await readFile(fromRoot("public/_headers"), "utf8");

    expect(headers).toContain("Content-Security-Policy:");
    expect(headers).toContain("Permissions-Policy:");
    expect(headers).toContain("/assets/*");
    expect(headers).toContain("max-age=31536000, immutable");
    expect(headers).toContain("application/manifest+json");
    expect(headers).toContain("/sw.js\n  Cache-Control: no-cache");
  });
});
