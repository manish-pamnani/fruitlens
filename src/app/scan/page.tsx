"use client";

import { useCallback, useRef, useState } from "react";
import CameraFeed from "@/components/CameraFeed";
import ScanOverlay from "@/components/ScanOverlay";
import { classifyFrame, type Prediction } from "@/lib/inference";

export default function ScanPage() {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const isClassifying = useRef(false);

  const handleFrame = useCallback((video: HTMLVideoElement) => {
    if (isClassifying.current) return;
    isClassifying.current = true;

    classifyFrame(video)
      .then(setPrediction)
      .catch((err) => console.error("Classification failed:", err))
      .finally(() => {
        isClassifying.current = false;
      });
  }, []);

  return (
    <div className="relative h-dvh w-full bg-black">
      <CameraFeed onFrame={handleFrame} />
      <ScanOverlay prediction={prediction} />
    </div>
  );
}
