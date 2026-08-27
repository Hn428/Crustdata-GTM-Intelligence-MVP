import type { Metadata } from "next";
import { PublishEditor } from "@/components/publish-editor";
import { getSearchCriteria } from "@/lib/intelligence/criteria";
import { runIntelligenceSearch } from "@/lib/intelligence/selected-provider";
import { createPublicReportFromSearch } from "@/lib/publication/mock-reports";

export const metadata: Metadata = {
  title: "Publish Market Report",
  robots: { index: false, follow: false },
};

export default async function PublishPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const [{ id }, queryParams] = await Promise.all([params, searchParams]);
  const query = typeof queryParams.q === "string" ? queryParams.q.slice(0, 500) : undefined;
  const search = await runIntelligenceSearch(getSearchCriteria(id, query));
  return <PublishEditor report={createPublicReportFromSearch(search)} source={search.source} notice={search.notice} />;
}
