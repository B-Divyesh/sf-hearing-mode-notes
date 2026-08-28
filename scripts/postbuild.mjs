import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

await sharp("assets/src/app-icon.svg").resize(192, 192).png().toFile("public/icon-192.png");
await sharp("assets/src/app-icon.svg").resize(512, 512).png().toFile("public/icon-512.png");
await copyFile("public/icon-192.png", "dist/icon-192.png");
await copyFile("public/icon-512.png", "dist/icon-512.png");

const html = await readFile("dist/index.html", "utf8");
for (const route of ["privacy", "terms"]) {
  await mkdir(`dist/${route}`, { recursive: true });
  await writeFile(`dist/${route}/index.html`, html);
}
