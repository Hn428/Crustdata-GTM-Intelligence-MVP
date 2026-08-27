import type { Metadata } from "next";
import { PublishEditor } from "@/components/publish-editor";
import { getSearchCriteria } from "@/lib/intelligence/criteria";
import { runIntelligenceSearch } from "@/lib/intelligence/selected-provider";
import { createPublicReportFromSearch } from "@/lib/publication/mock-reports";

export const metadata: Metadata = {
  title: "Publish Market Report",
  robots: { index: false, follow: false },
};

export default async function PublishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const search = await runIntelligenceSearch(getSearchCriteria(id));
  return <PublishEditor report={createPublicReportFromSearch(search)} source={search.source} notice={search.notice} />;
}
