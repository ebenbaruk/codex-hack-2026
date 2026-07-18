import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { CampaignDashboard } from "@/components/campaign-dashboard";
import { demoCampaign } from "@/lib/buyable/engine";
import { getBuyableStore } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title:
      id === "demo-lyon-services"
        ? "Lyon acquisition conviction list"
        : "Acquisition conviction list",
  };
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const campaign =
    id === demoCampaign.campaign_id
      ? {
          ...demoCampaign,
          campaign_url: host
            ? `${protocol}://${host}/campaigns/${demoCampaign.campaign_id}`
            : demoCampaign.campaign_url,
        }
      : await getBuyableStore().getCampaign(id);

  if (!campaign) {
    notFound();
  }

  return <CampaignDashboard campaign={campaign} />;
}
