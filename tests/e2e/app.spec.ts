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
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""));
  expect(serious).toEqual([]);
});

test("works offline after the app shell is installed", async ({ page, context }) => {
  await page.goto("/");
  await page.waitForFunction(async () => Boolean(await navigator.serviceWorker?.ready));
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

test("privacy and terms are directly addressable", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { level: 1, name: "Your notes stay yours." })).toBeVisible();
  await page.goto("/terms");
  await expect(page.getByRole("heading", { level: 1, name: "Terms of use" })).toBeVisible();
});
