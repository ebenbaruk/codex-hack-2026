import { expect, test } from "@playwright/test";

test("landing page tells the Codex-first story", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Find the business before/i }),
  ).toBeVisible();
  await expect(page.getByText("Codex → Ginse → Buyable")).toBeVisible();
  await expect(page.getByRole("link", { name: /Explore the live result/i })).toBeVisible();
});

test("demo campaign exposes ten ranked targets and evidence", async ({ page }) => {
  await page.goto("/campaigns/demo-lyon-services");
  await expect(page.getByRole("heading", { name: "Lyon local services" })).toBeVisible();
  await expect(page.getByText("10 qualified businesses")).toBeVisible();
  const evidenceTab = page.getByRole("tab", { name: "Evidence" });
  await expect(evidenceTab).toBeVisible();
  await evidenceTab.click();
  await expect(page.getByText("What we know")).toBeVisible();
  await page.getByRole("tab", { name: "Outreach packet" }).click();
  await expect(page.getByText("Confidential first-contact email")).toBeVisible();
  await expect(page.getByText("Synthetic hackathon demonstration data")).toBeVisible();
});

test("run endpoint rejects unsigned and malformed invocations", async ({ request }) => {
  const input = {
    region: "Auvergne-Rhône-Alpes",
    sectors: ["hvac", "plumbing"],
    cash_available_eur: 250000,
    revenue_range_eur: { min: 750000, max: 4000000 },
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
