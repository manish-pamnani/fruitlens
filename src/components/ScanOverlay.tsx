import type { Prediction } from "@/lib/inference";
import ResultCard from "./ResultCard";

interface ScanOverlayProps {
  prediction: Prediction | null;
}

export default function ScanOverlay({ prediction }: ScanOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-6">
      <ResultCard prediction={prediction} />
    </div>
  );
}
