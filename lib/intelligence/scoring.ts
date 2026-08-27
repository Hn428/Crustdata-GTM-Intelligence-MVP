export type FitScoreInput = {
  employeeCount: number;
  minEmployees?: number;
  maxEmployees?: number;
  industryMatches: boolean;
  lastFundingDate?: string;
  headcountGrowth6m?: number;
  recentJobCount: number;
  gtmJobCount: number;
};

function isRecentFunding(date?: string) {
  if (!date) return false;
  const timestamp = Date.parse(date);
  if (Number.isNaN(timestamp)) return false;
  const eighteenMonthsMs = 548 * 24 * 60 * 60 * 1000;
  return Date.now() - timestamp <= eighteenMonthsMs;
}

export function calculateFitScore(input: FitScoreInput) {
  let score = 0;

  const aboveMinimum = input.minEmployees === undefined || input.employeeCount >= input.minEmployees;
  const belowMaximum = input.maxEmployees === undefined || input.employeeCount <= input.maxEmployees;
  if (aboveMinimum && belowMaximum) score += 10;

  if (input.industryMatches) score += 15;
  if (isRecentFunding(input.lastFundingDate)) score += 20;

  if ((input.headcountGrowth6m ?? 0) >= 10) score += 15;
  else if ((input.headcountGrowth6m ?? 0) > 0) score += 8;

  if (input.recentJobCount >= 5) score += 15;
  else if (input.recentJobCount > 0) score += 8;

  if (input.gtmJobCount > 0) score += 25;

  return Math.min(100, score);
}
