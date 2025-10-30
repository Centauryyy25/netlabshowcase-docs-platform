import { cache } from "react";

import { db, labs } from "@/db";
import { eq, desc } from "drizzle-orm";

import type { LabPreview } from "@/components/ui/marquee-labs";
import { LandingPageContent } from "./LandingPageContent";

const FALLBACK_LABS: LabPreview[] = [
  { id: "fallback-hybrid-cloud", title: "Hybrid Cloud Topology Playbook", category: "Cloud" },
  { id: "fallback-evpn", title: "EVPN Fabric Quickstart", category: "Data Center" },
  { id: "fallback-zero-trust", title: "Zero Trust Remote Office", category: "Security" },
  { id: "fallback-routing", title: "Multi-Vendor Routing Sandbox", category: "Routing" },
  { id: "fallback-automation", title: "Campus Automation Toolkit", category: "Automation" },
  { id: "fallback-lte", title: "LTE Failover Lab", category: "Edge" },
  { id: "fallback-bgp", title: "BGP Policy Lab", category: "Routing" },
  { id: "fallback-segment-routing", title: "Segment Routing Explorer", category: "Core" },
  { id: "fallback-firewall-ha", title: "Firewall High Availability", category: "Security" },
  { id: "fallback-observability", title: "Observability Pipeline", category: "Monitoring" },
];

const fetchFeaturedLabs = cache(async (): Promise<LabPreview[]> => {
  if (!process.env.DATABASE_URL) {
    return FALLBACK_LABS;
  }

  try {
    const result = await db
      .select({
        id: labs.id,
        title: labs.title,
        category: labs.category,
      })
      .from(labs)
      .where(eq(labs.status, "published"))
      .orderBy(desc(labs.createdAt))
      .limit(10);

    return result;
  } catch (error) {
    console.warn("[LandingPage] Falling back to static labs for marquee", error);
    return FALLBACK_LABS;
  }
});

export default async function LandingPage() {
  const labs = await fetchFeaturedLabs();

  return <LandingPageContent labs={labs} />;
}
