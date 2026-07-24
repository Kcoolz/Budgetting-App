import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    indexedDB.deleteDatabase("cloud-budget-local");
  });
  await page.goto("/");
});

test("loads the private planner and navigates its main views", async ({ page }) => {
  await expect(page).toHaveTitle(/Cloud Budget/);
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Primary navigation" })).toBeVisible();
  await page.getByRole("link", { name: "Organize" }).click();
  await expect(page.getByRole("heading", { name: "Make Cloud work your way." })).toBeVisible();
  await page.getByRole("link", { name: "Goals" }).click();
  await expect(page.getByRole("heading", { name: "Save for what matters." })).toBeVisible();
});

test("dialog traps focus, has an accessible name, and closes with Escape", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Add transaction" }).first();
  await trigger.focus();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Add activity" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(":focus")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("interactive controls expose accessible names", async ({ page }) => {
  const unnamed = await page.locator("button, a, input, select, textarea").evaluateAll((elements) => (
    elements.filter((element) => {
      if (element.matches('input[type="hidden"], [aria-hidden="true"], [tabindex="-1"]')) return false;
      const label = element.getAttribute("aria-label")
        || element.getAttribute("title")
        || element.textContent?.trim()
        || (element.id && document.querySelector(`label[for="${CSS.escape(element.id)}"]`)?.textContent?.trim())
        || element.closest("label")?.textContent?.trim();
      return !label;
    }).map((element) => element.outerHTML.slice(0, 180))
  ));
  expect(unnamed, `Controls without accessible names:\n${unnamed.join("\n")}`).toEqual([]);
});

test("dark mode applies immediately and persists for this browser", async ({ page, context }) => {
  await page.getByRole("button", { name: "Use dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => localStorage.getItem("cloud-budget-theme"))).toBe("dark");

  const reopened = await context.newPage();
  await reopened.goto("/");
  await expect(reopened.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(reopened.getByRole("button", { name: "Use light mode" })).toBeVisible();
});

test("mobile shell stays within the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
