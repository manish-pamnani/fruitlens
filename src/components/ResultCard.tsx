import type { Prediction } from "@/lib/inference";

interface ResultCardProps {
  prediction: Prediction | null;
}

export default function ResultCard({ prediction }: ResultCardProps) {
  if (!prediction) {
    return (
      <div className="rounded-xl bg-black/60 px-4 py-3 text-sm text-white/70">
        Point the camera at a fruit…
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-black/60 px-4 py-3 text-white">
      <div className="text-lg font-semibold capitalize">
        {prediction.label}
      </div>
      <div className="text-sm text-white/70">
        {(prediction.confidence * 100).toFixed(0)}% confidence
      </div>
      {/* Freshness result goes here once a freshness model/approach is chosen. */}
    </div>
  );
}
