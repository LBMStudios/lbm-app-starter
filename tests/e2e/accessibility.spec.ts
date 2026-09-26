import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { publicRoutes } from "./routes";
import { observePage } from "./support/observe-page";

for (const route of publicRoutes) {
  test(`${route.name} has no automatically detectable accessibility violations`, async ({ page }, testInfo) => {
    const assertHealthy = observePage(page);

    await page.goto(route.path, { waitUntil: "networkidle" });
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    if (result.violations.length > 0) {
      await testInfo.attach("accessibility-violations", {
        body: JSON.stringify(result.violations, null, 2),
        contentType: "application/json",
      });
    }

    expect(result.violations, `Accessibility violations on ${route.path}`).toEqual([]);
    await assertHealthy(testInfo);
  });
}
