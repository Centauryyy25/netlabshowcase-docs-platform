import { cache } from "react";

import { db, labs } from "@/db";
import { eq, desc } from "drizzle-orm";

import type { LabPreview } from "@/components/ui/marquee-labs";
import { LandingPageContent } from "./LandingPageContent";

const fetchFeaturedLabs = cache(async (): Promise<LabPreview[]> => {
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
    console.error("[LandingPage] Failed to fetch labs for marquee", error);
    return [];
  }
});

export default async function LandingPage() {
  const labs = await fetchFeaturedLabs();

  return <LandingPageContent labs={labs} />;
}

