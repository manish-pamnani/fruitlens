export type Freshness = "fresh" | "not_fresh" | "unknown";

export interface AnalysisResult {
  label: string;
  isFruit: boolean;
  freshness: Freshness;
  explanation: string;
}
