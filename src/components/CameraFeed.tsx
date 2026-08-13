"use client";

import { useEffect, useRef } from "react";

interface CameraFeedProps {
  onFrame?: (video: HTMLVideoElement) => void;
  frameIntervalMs?: number;
}

export default function CameraFeed({
  onFrame,
  frameIntervalMs = 200,
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // In dev, Strict Mode mounts this effect twice back-to-back, so a
    // getUserMedia() call from the first mount can resolve after cleanup
    // already ran. `cancelled` lets that stale call bail out instead of
    // stomping on the second mount's stream (which was aborting play()).
    let cancelled = false;
    let activeStream: MediaStream | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function start() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      if (cancelled) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      activeStream = stream;

      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;
      try {
        await video.play();
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        throw err;
      }

      if (cancelled) return;
      if (onFrame) {
        intervalId = setInterval(() => onFrame(video), frameIntervalMs);
      }
    }

    start().catch((err) => {
      console.error("Camera access failed:", err);
    });

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      activeStream?.getTracks().forEach((track) => track.stop());
    };
  }, [onFrame, frameIntervalMs]);

  return (
    <video
      ref={videoRef}
      playsInline
      muted
      className="h-full w-full object-cover"
    />
  );
}
