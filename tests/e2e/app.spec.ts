import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function saveSetup(page: import("@playwright/test").Page, values: { place: string; mode: string; volume?: string; details?: string } = { place: "Restaurant", mode: "Conversation" }): Promise<void> {
  await page.getByRole("button", { name: "Note a setup" }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: values.place, exact: true }).click();
  await page.getByLabel("Listening mode").fill(values.mode);
  if (values.volume) await page.getByLabel("Volume or level").fill(values.volume);
  if (values.details) await page.getByLabel("What made it work?").fill(values.details);
  await page.getByRole("button", { name: "Save setup" }).click();
}

test("@claim:sample-sandbox loads three realistic sample notes and keeps real notes separate", async ({ page }) => {
  await page.goto("/");
  await saveSetup(page, { place: "Home", mode: "Everyday", details: "Real notebook note" });
  await expect(page.getByRole("heading", { name: "Setup for Home" })).toBeVisible();

  await page.goto("/demo");
  await expect(page.getByLabel("Demo mode")).toContainText("Nothing is saved to your notebook.");
  await expect(page.getByRole("heading", { name: "Setup for Restaurant" })).toBeVisible();
  await page.getByRole("link", { name: "History" }).last().click();
  await expect(page.locator(".note-entry")).toHaveCount(3);
  await page.getByRole("button", { name: "Start for real" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Setup for Home" })).toBeVisible();
  await page.getByRole("link", { name: "History" }).last().click();
  await expect(page.locator(".note-entry").first()).toContainText("Real notebook note");
});

test("@claim:recall-last-setup saves a setup and shows the successful one first", async ({ page }) => {
  await page.goto("/demo");
  await saveSetup(page, { place: "Restaurant", mode: "Music", volume: "2", details: "Near the wall" });
  await expect(page.getByRole("heading", { name: "Setup for Restaurant" })).toBeVisible();
  await expect(page.getByText("Music", { exact: true })).toBeVisible();
});

test("@claim:search-notes finds a setup by the words in its note", async ({ page }) => {
  await page.goto("/demo?view=history");
  await page.getByLabel("Search notes").fill("quieter corner");
  await expect(page.locator(".note-entry")).toHaveCount(1);
  await expect(page.locator(".note-entry")).toContainText("Restaurant");
});

test("@claim:export-notes exports complete JSON and portable CSV from sample data", async ({ page }) => {
  await page.goto("/demo?view=settings");
  const jsonDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const json = await jsonDownload;
  expect(json.suggestedFilename()).toMatch(/^hearing-mode-notes-.*\.json$/);
  const jsonPath = await json.path();
  expect(jsonPath).not.toBeNull();
  const jsonBuffer = await json.createReadStream();
  const chunks: Buffer[] = [];
  if (jsonBuffer) for await (const chunk of jsonBuffer) chunks.push(Buffer.from(chunk));
  const bundle = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  expect(bundle.notes).toHaveLength(3);
  expect(bundle.notes.map((note: { place: string }) => note.place)).toContain("Restaurant");

  const csvDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const csv = await csvDownload;
  const csvStream = await csv.createReadStream();
  const csvChunks: Buffer[] = [];
  if (csvStream) for await (const chunk of csvStream) csvChunks.push(Buffer.from(chunk));
  const csvText = Buffer.concat(csvChunks).toString("utf8");
  expect(csvText.split("\n")[0]).toContain('"place","mode","volume"');
  expect(csvText.split("\n")).toHaveLength(4);
});

test("@claim:import-notes imports a valid backup and makes its setup available", async ({ page }) => {
  const bundle = {
    product: "hearing-mode-notes",
    version: 1,
    exportedAt: "2026-09-05T12:00:00.000Z",
    settings: { theme: "dark", customPlaces: ["Library"] },
    notes: [{ id: "imported-library", place: "Library", mode: "Conversation", volume: "3", details: "Front desk was quiet", comfort: 4, worked: true, location: null, createdAt: "2026-09-05T11:00:00.000Z", updatedAt: "2026-09-05T11:00:00.000Z" }]
  };
  await page.goto("/demo?view=settings");
  await page.locator("[data-import]").setInputFiles({ name: "hearing-mode-notes.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(bundle)) });
  await page.getByRole("link", { name: "History" }).last().click();
  await expect(page.locator('.note-entry[data-note-id="imported-library"]')).toContainText("Library");
});

test("@claim:offline-reload works offline after the first visit", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto("/demo");
    await page.waitForFunction(async () => {
      const registration = await navigator.serviceWorker?.getRegistration();
      return Boolean(registration?.active && navigator.serviceWorker?.controller);
    });
    await page.evaluate(() => { (window as unknown as { __reloadMarker: boolean }).__reloadMarker = true; });
    await context.setOffline(true);
    // Chromium can report an offline navigation event before the worker's
    // cached document finishes parsing, so wait for that document when present.
    await page.reload({ waitUntil: "domcontentloaded", timeout: 10_000 }).catch(() => undefined);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __reloadMarker?: boolean }).__reloadMarker ?? false)).toBe(false);
    await expect(page.getByRole("heading", { name: "Setup for Restaurant" })).toBeVisible();
    await expect(page.getByLabel("Demo mode")).toBeVisible();
  } finally {
    await context.close();
  }
});

test("@claim:private-local-notes keeps notes local with no microphone or third-party requests", async ({ page }) => {
  await page.addInitScript(() => {
    let microphoneCalls = 0;
    Object.defineProperty(window, "__microphoneCalls", { value: () => microphoneCalls });
    if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = (() => { microphoneCalls += 1; return Promise.reject(new DOMException("blocked")); }) as typeof navigator.mediaDevices.getUserMedia;
  });
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    const requestUrl = new URL(request.url());
    if (requestUrl.origin !== "http://127.0.0.1:4173") externalRequests.push(request.url());
  });
  await page.goto("/demo");
  await page.getByRole("link", { name: "History" }).last().click();
  await page.getByLabel("Search notes").fill("train");
  expect(await page.evaluate(() => (window as unknown as { __microphoneCalls: () => number }).__microphoneCalls())).toBe(0);
  expect(externalRequests).toEqual([]);
});

test("@claim:optional-location requests location only after the person presses its button", async ({ page }) => {
  await page.addInitScript(() => {
    let calls = 0;
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition(success: PositionCallback) { calls += 1; success({ coords: { latitude: 1, longitude: 2, accuracy: 3 } } as GeolocationPosition); } } });
    Object.defineProperty(window, "__locationCalls", { value: () => calls });
  });
  await page.goto("/demo");
  expect(await page.evaluate(() => (window as unknown as { __locationCalls: () => number }).__locationCalls())).toBe(0);
  await page.getByRole("button", { name: "Note a setup" }).first().click();
  expect(await page.evaluate(() => (window as unknown as { __locationCalls: () => number }).__locationCalls())).toBe(0);
  await page.getByRole("button", { name: "Add current location" }).click();
  await expect(page.getByText("Location added to this note only.")).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __locationCalls: () => number }).__locationCalls())).toBe(1);
});

test("@claim:no-device-control does not ask the browser to connect to a hearing device", async ({ page }) => {
  await page.addInitScript(() => {
    let requests = 0;
    Object.defineProperty(navigator, "bluetooth", { configurable: true, value: { requestDevice() { requests += 1; return Promise.reject(new DOMException("blocked")); } } });
    Object.defineProperty(window, "__deviceRequests", { value: () => requests });
  });
  await page.goto("/demo");
  await page.getByRole("button", { name: "Show reminder" }).first().click();
  expect(await page.evaluate(() => (window as unknown as { __deviceRequests: () => number }).__deviceRequests())).toBe(0);
});

test("@claim:theme-choice applies light, dark, and system notebook themes", async ({ page }) => {
  await page.goto("/demo?view=settings");
  await page.getByRole("radio", { name: "Dark" }).check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("radio", { name: "Light" }).check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("radio", { name: "System" }).check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "system");
});

test("@claim:custom-place-tabs adds a reusable place tab", async ({ page }) => {
  await page.goto("/demo?view=settings");
  await page.getByLabel("Add a place tab").fill("Library");
  await page.getByRole("button", { name: "Add place" }).click();
  await page.locator("[data-new]:visible").first().click();
  await expect(page.getByRole("dialog").getByRole("button", { name: "Library" })).toBeVisible();
});

test("@claim:reminder-fallback shows the saved setup when notifications are unavailable", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, "Notification", { configurable: true, value: undefined }));
  await page.goto("/demo");
  await page.getByRole("button", { name: "Show reminder" }).first().click();
  await expect(page.getByRole("status")).toContainText(/Restaurant: Conversation/);
});

test("rejects a malformed branded import without breaking the next launch", async ({ page }) => {
  const malformed = {
    product: "hearing-mode-notes",
    version: 1,
    exportedAt: "2026-09-05T12:00:00.000Z",
    settings: { theme: "invalid", customPlaces: null },
    notes: [{ id: "not-enough" }]
  };
  await page.goto("/demo?view=settings");
  await page.locator("[data-import]").setInputFiles({ name: "bad.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(malformed)) });
  await expect(page.getByRole("status")).toContainText("not a supported");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Settings and data" })).toBeVisible();
});

test("restores focus after dialog close and save, and moves place tabs with arrow keys", async ({ page }) => {
  await page.goto("/demo");
  const opener = page.getByRole("button", { name: "Note a setup" }).first();
  await opener.focus();
  await opener.press("Enter");
  const home = page.getByRole("dialog").getByRole("button", { name: "Home", exact: true });
  await home.focus();
  await home.press("ArrowRight");
  await expect(page.getByRole("dialog").getByRole("button", { name: "Work", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(opener).toBeFocused();
  await opener.press("Enter");
  await page.getByRole("dialog").getByRole("button", { name: "Home", exact: true }).click();
  await page.getByLabel("Listening mode").fill("Everyday");
  await page.getByRole("button", { name: "Save setup" }).click();
  await expect(page.locator("main#main")).toBeFocused();
});

test("has no serious or critical accessibility violations in light and dark reduced-motion modes", async ({ page }) => {
  await page.goto("/demo");
  const light = await new AxeBuilder({ page }).analyze();
  expect(light.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.reload();
  const dark = await new AxeBuilder({ page }).analyze();
  expect(dark.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
});

test("keeps branded and footer links at least 44 pixels high on a phone", async ({ page }) => {
  await page.goto("/demo");
  const undersized = await page.locator(".brand, .site-footer a").evaluateAll((items) => items.filter((item) => item.getBoundingClientRect().height < 44).map((item) => ({ text: item.textContent, height: item.getBoundingClientRect().height })));
  expect(undersized).toEqual([]);
});

test("sets direct route titles and shows a designed 404 screen", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page).toHaveTitle("Privacy — Hearing Mode Notes");
  await page.goto("/terms");
  await expect(page).toHaveTitle("Terms — Hearing Mode Notes");
  await page.goto("/404.html");
  await expect(page.getByRole("heading", { name: "This page was not found" })).toBeVisible();
});

test("keeps a server 404 after the service worker takes control", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto("/demo");
    await page.waitForFunction(async () => {
      const registration = await navigator.serviceWorker?.getRegistration();
      return Boolean(registration?.active && navigator.serviceWorker?.controller);
    });
    const response = await page.goto("/__e2e-upstream-404");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Upstream page missing" })).toBeVisible();
  } finally {
    await context.close();
  }
});

test("moves focus and announces the new page after in-app navigation", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("link", { name: "History" }).last().click();
  await expect(page.getByRole("heading", { name: "Setup history" })).toBeFocused();
  await expect(page.locator("#route-announcer")).toHaveText("Setup history page");
});
