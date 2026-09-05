import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";

const html = await readFile("dist/index.html", "utf8");
const pages = [
  { route: "privacy", title: "Privacy — Hearing Mode Notes", description: "Read how Hearing Mode Notes keeps listening setup notes in your browser.", canonical: "/privacy" },
  { route: "terms", title: "Terms — Hearing Mode Notes", description: "Read the terms for using Hearing Mode Notes as a personal memory aid.", canonical: "/terms" },
  { route: "demo", title: "Demo — Hearing Mode Notes", description: "Try three sample hearing-aid setup notes without changing your notebook.", canonical: "/demo" },
  { route: "history", title: "History — Hearing Mode Notes", description: "Find saved hearing-aid setups by place, mode, volume, or note.", canonical: "/history" },
  { route: "settings", title: "Settings — Hearing Mode Notes", description: "Choose an appearance and move local Hearing Mode Notes data.", canonical: "/settings" }
];

function pageHtml({ title, description, canonical }) {
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="https://hearing-mode-notes.sociobot.in${canonical}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${description}" />`);
}

for (const page of pages) {
  const { route } = page;
  await mkdir(`dist/${route}`, { recursive: true });
  await writeFile(`dist/${route}/index.html`, pageHtml(page));
}
await writeFile("dist/404.html", pageHtml({ route: "404", title: "Page not found — Hearing Mode Notes", description: "Return to Hearing Mode Notes to save or find a listening setup.", canonical: "/404" }));
await copyFile("staticwebapp.config.json", "dist/staticwebapp.config.json");
