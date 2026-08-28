import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("saves, recalls, searches, and edits a setup", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /Remember what worked/ })).toBeVisible();
  await page.getByRole("button", { name: "Note a setup" }).first().click();
  await page.getByRole("button", { name: "Restaurant" }).click();
  await page.getByLabel("Listening mode").fill("Conversation");
  await page.getByLabel("Volume or level").fill("Level 3");
  await page.getByLabel("4").check();
  await page.getByLabel("What made it work?").fill("Back to the wall");
  await page.getByRole("button", { name: "Save setup" }).click();

  await expect(page.getByRole("heading", { name: /Ready to return to Restaurant/ })).toBeVisible();
  await page.getByRole("button", { name: "History" }).click();
  await expect(page.getByRole("heading", { name: "Conversation" })).toBeVisible();
  await page.getByLabel("Search notes").fill("wall");
  await expect(page.locator("#main").getByText("Restaurant", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Volume or level").fill("Level 2");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Level 2", { exact: true })).toBeVisible();
});

test("has no serious or critical accessibility violations", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(300);
  const lightResults = await new AxeBuilder({ page }).analyze();
  expect(lightResults.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.reload();
  const darkResults = await new AxeBuilder({ page }).analyze();
  expect(darkResults.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
});

test("ships its precached icon, activates the worker, and works offline", async ({ page, context }) => {
  const iconResponse = await page.goto("/icon.svg");
  expect(iconResponse?.headers()["content-type"]).toContain("image/svg+xml");
  expect(await iconResponse?.text()).toContain("<svg");
  await page.goto("/");
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker?.getRegistration();
    return Boolean(registration?.active && navigator.serviceWorker?.controller);
  });
  await page.getByRole("button", { name: "Note a setup" }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: "Home", exact: true }).click();
  await page.getByLabel("Listening mode").fill("Everyday");
  await page.getByRole("button", { name: "Save setup" }).click();
  await expect(page.getByRole("heading", { name: /Ready to return to Home/ })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: /Ready to return to Home/ })).toBeVisible();
  await expect(page.getByText("Offline — notes still work")).toBeAttached();
});

test("skip link moves keyboard focus into the main landmark", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});

test("privacy and terms are directly addressable", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { level: 1, name: "Your notes stay yours." })).toBeVisible();
  await page.goto("/terms");
  await expect(page.getByRole("heading", { level: 1, name: "Terms of use" })).toBeVisible();
});

test("licensed users can add a reusable custom place tab", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("sb_license:hearing-mode-notes", "test-license");
    localStorage.setItem("sb_license_verdict:hearing-mode-notes", JSON.stringify({ valid: true, checkedAt: Date.now() }));
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByText("License active", { exact: true })).toBeVisible();
  await page.getByLabel("Add a custom place tab").fill("Community hall");
  await page.getByRole("button", { name: "Add place" }).click();
  await page.locator("[data-new]:visible").first().click();
  await expect(page.getByRole("dialog").getByRole("button", { name: "Community hall" })).toBeVisible();
});
