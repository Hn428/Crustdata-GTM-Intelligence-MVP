import "server-only";

import type {
  CrustdataCompanySearchResponse,
  CrustdataErrorResponse,
  CrustdataJobSearchResponse,
} from "@/lib/intelligence/crustdata-types";

const CRUSTDATA_BASE_URL = "https://api.crustdata.com";
const CRUSTDATA_API_VERSION = "2025-11-01";
const REQUEST_TIMEOUT_MS = 20_000;

type CrustdataPath = "/company/search" | "/job/search";

export class CrustdataApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "CrustdataApiError";
  }
}

function statusMessage(status: number) {
  if (status === 401) return "Crustdata rejected the API key.";
  if (status === 403) return "This Crustdata key cannot access the requested endpoint or fields.";
  if (status === 429) return "Crustdata rate-limited the search. Try again shortly.";
  if (status >= 500) return "Crustdata is temporarily unavailable.";
  return `Crustdata returned HTTP ${status}.`;
}

export class CrustdataClient {
  constructor(private readonly apiKey: string) {
    if (!apiKey.trim()) {
      throw new CrustdataApiError("CRUSTDATA_API_KEY is not configured.");
    }
  }

  searchCompanies(body: Record<string, unknown>) {
    return this.request<CrustdataCompanySearchResponse>("/company/search", body);
  }

  searchJobs(body: Record<string, unknown>) {
    return this.request<CrustdataJobSearchResponse>("/job/search", body);
  }

  private async request<T>(path: CrustdataPath, body: Record<string, unknown>): Promise<T> {
    let response: Response;

    try {
      response = await fetch(`${CRUSTDATA_BASE_URL}${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "x-api-version": CRUSTDATA_API_VERSION,
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      const detail = error instanceof Error && error.name === "TimeoutError" ? "The request timed out." : "The network request failed.";
      throw new CrustdataApiError(`Could not reach Crustdata. ${detail}`);
    }

    if (!response.ok) {
      let apiError: CrustdataErrorResponse = {};
      const rawErrorBody = await response.text();
      try {
        apiError = JSON.parse(rawErrorBody) as CrustdataErrorResponse;
      } catch {
        // The status-specific message below is enough when the body is not JSON.
      }

      const nestedDetail = apiError.errors
        ?.map((item) => item.message ?? item.description)
        .filter((item): item is string => Boolean(item))
        .join("; ");
      const rawDetail = rawErrorBody.trim().replace(/\s+/g, " ");
      const detail = apiError.description ?? apiError.detail ?? apiError.message ?? nestedDetail ?? rawDetail;
      const safeDetail = detail ? ` ${detail.slice(0, 240)}` : "";
      throw new CrustdataApiError(`${statusMessage(response.status)}${safeDetail}`, response.status);
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new CrustdataApiError("Crustdata returned malformed JSON.", response.status);
    }
  }
}
