import { expect, test } from "@playwright/test";

test("landing page tells the Codex acquisition-intelligence story", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Know which business/i }),
  ).toBeVisible();
  await expect(page.getByText("Codex → Ginse → Buyable")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Explore the killer demo/i }),
  ).toBeVisible();
  await expect(page.getByText("2,500 businesses scanned")).toBeVisible();
});

test("demo campaign exposes the funnel, conviction ranking and Deal Pack", async ({
  page,
}) => {
  await page.goto("/campaigns/demo-lyon-services");
  await expect(
    page.getByRole("heading", { name: "Acquisition conviction list" }),
  ).toBeVisible();
  await expect(page.getByText(/2.?500/).first()).toBeVisible();
  await expect(page.getByText("Why #1 wins")).toBeVisible();
  await expect(page.getByText("10 curated businesses")).toBeVisible();

  await page.getByLabel("Available buyer cash").fill("75000");
  await expect(page.getByText("WHAT-IF")).toBeVisible();

  await page.getByRole("tab", { name: "Evidence" }).click();
  await expect(
    page.getByText("Observable transition signals", { exact: true }),
  ).toBeVisible();

  await page.getByRole("tab", { name: "Financing" }).click();
  await expect(page.getByText("Balanced acquisition")).toBeVisible();

  await page.getByRole("tab", { name: "Documents" }).click();
  await expect(page.getByText("Acquisition Deal Pack")).toBeVisible();
  await expect(
    page.getByText("Non-binding LOI draft", { exact: true }).last(),
  ).toBeVisible();
  await expect(
    page.getByText("Synthetic hackathon demonstration data"),
  ).toBeVisible();
});

test("run endpoint rejects unsigned and malformed invocations", async ({
  request,
}) => {
  const input = {
    region: "Auvergne-Rhône-Alpes",
    target_city: "Lyon",
    sectors: ["hvac", "plumbing"],
    cash_available_eur: 250000,
    revenue_range_eur: { min: 750000, max: 4000000 },
    employee_range: { min: 6, max: 60 },
    preferred_signals: [
      "recurring_revenue",
      "management_depth",
      "low_capex",
    ],
    avoid_signals: ["high_capex", "customer_concentration"],
    buyer_profile:
      "Hands-on operator seeking a recurring-revenue local service business",
  };

  const unsigned = await request.post("/run", { data: input });
  expect(unsigned.status()).toBe(401);

  const malformed = await request.post("/run", {
    data: input,
    headers: { Authorization: "Bearer not-a-jwt" },
  });
  expect(malformed.status()).toBe(401);
});
