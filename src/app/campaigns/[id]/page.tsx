import { notFound } from "next/navigation";
import type { Metadata } from "next";
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
    title: id === "demo-lyon-services" ? "Lyon acquisition campaign" : "Acquisition campaign",
  };
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign =
    id === demoCampaign.campaign_id
      ? demoCampaign
      : await getBuyableStore().getCampaign(id);

  if (!campaign) {
    notFound();
  }

  return <CampaignDashboard campaign={campaign} />;
}

