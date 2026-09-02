import { expect, test } from "@playwright/test";
import { publicRoutes } from "./routes";
import { observePage } from "./support/observe-page";

for (const route of publicRoutes) {
  test(`${route.name} loads without browser errors`, async ({ page }, testInfo) => {
    const assertHealthy = observePage(page);

    const response = await page.goto(route.path, { waitUntil: "networkidle" });

    expect(response?.ok(), `Expected a successful response for ${route.path}`).toBe(true);
    await expect(page.locator("body")).not.toBeEmpty();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(route.heading);
    await expect(page.locator("[data-nextjs-dialog], .vite-error-overlay")).toHaveCount(0);
    await assertHealthy(testInfo);
  });
}

test("home exposes the complete starter stack", async ({ page }, testInfo) => {
  const assertHealthy = observePage(page);

  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page.getByRole("region", { name: "Capacidades del starter" }).getByRole("article")).toHaveCount(4);
  await assertHealthy(testInfo);
});
