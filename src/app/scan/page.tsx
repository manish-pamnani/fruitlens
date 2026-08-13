"use client";

import { useRef, useState } from "react";
import CameraFeed, { type CameraFeedHandle } from "@/components/CameraFeed";
import ResultCard from "@/components/ResultCard";
import type { AnalysisResult } from "@/lib/analysis";

type ScanState =
  | { status: "live" }
  | { status: "analyzing"; frame: string }
  | { status: "result"; frame: string; result: AnalysisResult }
  | { status: "error"; frame: string; message: string };

export default function ScanPage() {
  const cameraRef = useRef<CameraFeedHandle>(null);
  const [state, setState] = useState<ScanState>({ status: "live" });

  const handleScan = async () => {
    const frame = cameraRef.current?.captureFrame();
    if (!frame) return;

    setState({ status: "analyzing", frame });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: frame }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }

      const result: AnalysisResult = await res.json();
      setState({ status: "result", frame, result });
    } catch (err) {
      setState({
        status: "error",
        frame,
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  };

  return (
    <div className="relative h-dvh w-full bg-black">
      <CameraFeed ref={cameraRef} />

      {state.status !== "live" && (
        // eslint-disable-next-line @next/next/no-img-element -- client-generated data URL, not a static/remote asset
        <img
          src={state.frame}
          alt="Captured frame"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 p-6">
        {state.status === "analyzing" && (
          <div className="rounded-xl bg-black/60 px-4 py-3 text-sm text-white">
            Analyzing…
          </div>
        )}

        {state.status === "result" && (
          <ResultCard
            result={state.result}
            onScanAgain={() => setState({ status: "live" })}
          />
        )}

        {state.status === "error" && (
          <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-xl bg-black/60 px-4 py-3 text-sm text-white">
            <span>{state.message}</span>
            <button
              onClick={() => setState({ status: "live" })}
              className="rounded-full bg-white px-4 py-2 text-xs font-medium text-black"
            >
              Try again
            </button>
          </div>
        )}

        {state.status === "live" && (
          <button
            onClick={handleScan}
            className="pointer-events-auto h-16 w-16 rounded-full border-4 border-white bg-white/20"
            aria-label="Scan"
          />
        )}
      </div>
    </div>
  );
}
