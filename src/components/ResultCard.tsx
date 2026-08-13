import type { AnalysisResult, Freshness } from "@/lib/analysis";

interface ResultCardProps {
  result: AnalysisResult;
  onScanAgain: () => void;
}

const FRESHNESS_LABEL: Record<Freshness, string> = {
  fresh: "Fresh",
  not_fresh: "Not fresh",
  unknown: "Freshness unclear",
};

export default function ResultCard({ result, onScanAgain }: ResultCardProps) {
  const color = result.isFruit ? "border-green-500" : "border-red-500";

  return (
    <div
      className={`pointer-events-auto w-full max-w-sm rounded-2xl border-2 ${color} bg-black/70 p-4 text-white`}
    >
      <div className="text-lg font-semibold">{result.label}</div>
      {result.isFruit && (
        <div className="text-sm text-white/80">
          {FRESHNESS_LABEL[result.freshness]}
        </div>
      )}
      <p className="mt-2 text-sm text-white/70">{result.explanation}</p>
      <button
        onClick={onScanAgain}
        className="mt-3 w-full rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
      >
        Scan again
      </button>
    </div>
  );
}
