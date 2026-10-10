import { test, expect } from "@playwright/test";

test("Household allergens and custom ingredients save and restore", async ({ page }) => {
  await page.goto("/#budget");
  await expect(page.getByRole("radio", { name: "Unknown / Not sure", exact: true })).toBeChecked();
  await page.getByRole("checkbox", { name: "Peanuts", exact: true }).check();
  await page.getByRole("checkbox", { name: "Eggs", exact: true }).check();
  await expect(page.getByRole("radio", { name: "Unknown / Not sure", exact: true })).not.toBeChecked();
  await page.getByRole("checkbox", { name: "Other", exact: true }).check();
  await page.getByLabel("Custom ingredient", { exact: true }).fill(" Kiwi ");
  await page.getByRole("button", { name: "Add custom allergen" }).click();
  await page.getByLabel("Custom ingredient", { exact: true }).fill("kiwi");
  await page.getByRole("button", { name: "Add custom allergen" }).click();
  await expect(page.getByRole("alert")).toHaveText("This ingredient is already selected.");
  await page.getByRole("button", { name: "Save Preferences" }).click();
  await expect(page).toHaveURL(/#home$/);
  await page.reload();
  await page.goto("/#budget");
  await expect(page.getByRole("checkbox", { name: "Peanuts", exact: true })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Eggs", exact: true })).toBeChecked();
  await expect(page.getByRole("button", { name: "Remove item — Kiwi" })).toBeVisible();
  await page.getByRole("button", { name: "Remove item — Kiwi" }).click();
  await page.getByRole("checkbox", { name: "Other", exact: true }).uncheck();
  await page.getByRole("button", { name: "Save Preferences" }).click();
  await page.goto("/#budget");
  await expect(page.getByRole("checkbox", { name: "Other", exact: true })).not.toBeChecked();
});

test("No allergies and unknown remain exclusive with restrictions", async ({ page }) => {
  await page.goto("/#budget");
  await page.getByRole("checkbox", { name: "Fish", exact: true }).check();
  await page.getByRole("radio", { name: "No known allergies", exact: true }).check();
  await expect(page.getByRole("checkbox", { name: "Fish", exact: true })).not.toBeChecked();
  await page.getByRole("button", { name: "Save Preferences" }).click();
  await page.goto("/#budget");
  await expect(page.getByRole("radio", { name: "No known allergies", exact: true })).toBeChecked();
  await page.getByRole("radio", { name: "Unknown / Not sure", exact: true }).check();
  await page.getByRole("button", { name: "Save Preferences" }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("aikasya.v1")!).allergies)).toEqual({ status: "unknown", allergens: [], custom: [], other: false });
  await page.goto("/#budget");
  await page.getByRole("checkbox", { name: "Other", exact: true }).check();
  await page.getByRole("button", { name: "Save Preferences" }).click();
  await expect(page.getByRole("alert")).toHaveText("Add a custom ingredient or deselect Other.");
  await expect(page).toHaveURL(/#budget$/);
});
