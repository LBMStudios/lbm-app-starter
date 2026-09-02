import { expect, type Page, type TestInfo } from "@playwright/test";

type BrowserIssue = {
  type: "console" | "pageerror" | "requestfailed" | "server";
  message: string;
};

export function observePage(page: Page) {
  const issues: BrowserIssue[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      issues.push({ type: "console", message: message.text() });
    }
  });

  page.on("pageerror", (error) => {
    issues.push({ type: "pageerror", message: error.message });
  });

  page.on("requestfailed", (request) => {
    issues.push({
      type: "requestfailed",
      message: `${request.method()} ${request.url()}: ${request.failure()?.errorText ?? "unknown error"}`,
    });
  });

  page.on("response", (response) => {
    if (response.status() >= 500) {
      issues.push({ type: "server", message: `${response.status()} ${response.url()}` });
    }
  });

  return async function assertHealthy(testInfo: TestInfo) {
    if (issues.length > 0) {
      await testInfo.attach("browser-issues", {
        body: JSON.stringify(issues, null, 2),
        contentType: "application/json",
      });
    }

    expect(issues, "The browser reported runtime, network, or server errors").toEqual([]);
  };
}
