import "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

let modelPromise: Promise<mobilenet.MobileNet> | null = null;

// Loads the pretrained MobileNet classifier once per session and reuses it
// across scans. This is a stand-in for a fruit-specific model (see
// src/lib/inference.ts for how its ImageNet output is mapped to fruits).
export function loadFruitModel(): Promise<mobilenet.MobileNet> {
  if (!modelPromise) {
    modelPromise = mobilenet.load({ version: 2, alpha: 1.0 });
  }
  return modelPromise;
}
