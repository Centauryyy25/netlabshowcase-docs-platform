import { cache } from "react";

import { db, labs, user } from "@/db";
import { desc, eq } from "drizzle-orm";

import type { LabPreview } from "@/components/ui/marquee-labs";
import { LandingPageContent } from "./LandingPageContent";
import type { LatestLabCard } from "./types";

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

const FALLBACK_LATEST_LABS: LatestLabCard[] = [
  {
    id: "latest-fallback-1",
    title: "AI-Driven Campus Automation",
    category: "Automation",
    authorName: "EtherDocs Team",
    authorImage: null,
  },
  {
    id: "latest-fallback-2",
    title: "Secure SD-WAN Blueprint",
    category: "Security",
    authorName: "NetLab Crew",
    authorImage: null,
  },
  {
    id: "latest-fallback-3",
    title: "Observability Pipeline Deep Dive",
    category: "Monitoring",
    authorName: "Labs Collective",
    authorImage: null,
  },
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

    return result.length ? result : FALLBACK_LABS;
  } catch (error) {
    console.warn("[LandingLayout] Falling back to static labs for marquee", error);
    return FALLBACK_LABS;
  }
});

const fetchLatestLabs = cache(async (): Promise<LatestLabCard[]> => {
  if (!process.env.DATABASE_URL) {
    return FALLBACK_LATEST_LABS;
  }

  try {
    const result = await db
      .select({
        id: labs.id,
        title: labs.title,
        category: labs.category,
        authorName: user.name,
        authorImage: user.image,
      })
      .from(labs)
      .leftJoin(user, eq(user.id, labs.userId))
      .where(eq(labs.status, "published"))
      .orderBy(desc(labs.createdAt))
      .limit(3);

    return result.length ? result : FALLBACK_LATEST_LABS;
  } catch (error) {
    console.warn("[LandingLayout] Falling back to static labs for latest grid", error);
    return FALLBACK_LATEST_LABS;
  }
});

export default async function LandingLayout() {
  const [featuredLabs, latestLabs] = await Promise.all([fetchFeaturedLabs(), fetchLatestLabs()]);

  return <LandingPageContent labs={featuredLabs} latestLabs={latestLabs} />;
}
