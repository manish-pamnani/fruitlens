import { loadFruitModel } from "./model";

export interface Prediction {
  label: string;
  confidence: number;
}

// MobileNet is a general-purpose ImageNet classifier, not a fruit-specific
// model. ImageNet-1k's only fruit classes are this contiguous block
// (indices 948-957) — everything else it recognizes (mango, watermelon,
// grapes, pears, etc.) has no matching class and won't be detected. This is
// a stand-in until a proper fruit-classifier model is trained/sourced.
const FRUIT_CLASS_LABELS: { keyword: string; label: string }[] = [
  { keyword: "granny smith", label: "Apple" },
  { keyword: "strawberry", label: "Strawberry" },
  { keyword: "orange", label: "Orange" },
  { keyword: "lemon", label: "Lemon" },
  { keyword: "fig", label: "Fig" },
  { keyword: "pineapple", label: "Pineapple" },
  { keyword: "banana", label: "Banana" },
  { keyword: "jackfruit", label: "Jackfruit" },
  { keyword: "custard apple", label: "Custard Apple" },
  { keyword: "pomegranate", label: "Pomegranate" },
];

const MIN_CONFIDENCE = 0.15;

function matchFruitLabel(className: string): string | null {
  const lower = className.toLowerCase();
  const match = FRUIT_CLASS_LABELS.find((f) => lower.includes(f.keyword));
  return match?.label ?? null;
}

// Runs a single classification pass on a video frame. Caller is responsible
// for throttling how often this is invoked (e.g. every ~150-250ms). Returns
// null when nothing in the top predictions maps to a known fruit class.
export async function classifyFrame(
  video: HTMLVideoElement,
): Promise<Prediction | null> {
  const model = await loadFruitModel();
  const predictions = await model.classify(video, 5);

  for (const { className, probability } of predictions) {
    if (probability < MIN_CONFIDENCE) continue;
    const label = matchFruitLabel(className);
    if (label) return { label, confidence: probability };
  }

  return null;
}
