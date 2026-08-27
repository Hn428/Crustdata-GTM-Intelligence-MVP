import "server-only";

import OpenAI from "openai";

const DEFAULT_TIMEOUT_MS = 90_000;

export class AgentConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgentConfigurationError";
  }
}

export function createOpenAIClient(apiKey: string) {
  if (!apiKey.trim()) throw new AgentConfigurationError("OPENAI_API_KEY is not configured.");

  return new OpenAI({
    apiKey,
    maxRetries: 1,
    timeout: DEFAULT_TIMEOUT_MS,
  });
}
