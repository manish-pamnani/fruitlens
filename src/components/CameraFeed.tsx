"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export interface CameraFeedHandle {
  // Captures the current frame as a downscaled JPEG data URL, or null if
  // the camera isn't ready yet.
  captureFrame: () => string | null;
}

const MAX_CAPTURE_DIMENSION = 768;

const CameraFeed = forwardRef<CameraFeedHandle>(function CameraFeed(_props, ref) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // In dev, Strict Mode mounts this effect twice back-to-back, so a
    // getUserMedia() call from the first mount can resolve after cleanup
    // already ran. `cancelled` lets that stale call bail out instead of
    // stomping on the second mount's stream (which was aborting play()).
    let cancelled = false;
    let activeStream: MediaStream | null = null;

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
    }

    start().catch((err) => {
      console.error("Camera access failed:", err);
    });

    return () => {
      cancelled = true;
      activeStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useImperativeHandle(ref, () => ({
    captureFrame: () => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) return null;

      const scale = Math.min(
        1,
        MAX_CAPTURE_DIMENSION / Math.max(video.videoWidth, video.videoHeight),
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);

      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.8);
    },
  }));

  return (
    <video
      ref={videoRef}
      playsInline
      muted
      className="h-full w-full object-cover"
    />
  );
});

export default CameraFeed;
