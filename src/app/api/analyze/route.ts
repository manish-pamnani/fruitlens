import { NextResponse } from "next/server";
import type { AnalysisResult } from "@/lib/analysis";

const OLLAMA_HOST = process.env.OLLAMA_HOST ?? "http://localhost:11434";
const MODEL = "moondream:v2";

const RESULT_SCHEMA = {
  type: "object",
  properties: {
    label: {
      type: "string",
      description: "Common name of what's shown, e.g. 'Banana', 'Corn', 'Plate'.",
    },
    isFruit: {
      type: "boolean",
      description:
        "True only if the object is a fruit — not a vegetable, grain, or unrelated object.",
    },
    freshness: {
      type: "string",
      enum: ["fresh", "not_fresh", "unknown"],
      description:
        "Only meaningful when isFruit is true. Use 'unknown' when isFruit is false or freshness can't be judged from the image.",
    },
    explanation: {
      type: "string",
      description:
        "One short sentence on the identification and, if a fruit, the freshness cues observed.",
    },
  },
  required: ["label", "isFruit", "freshness", "explanation"],
} as const;

function parseDataUrl(dataUrl: string): string | null {
  const match = /^data:image\/(?:jpeg|png|webp);base64,(.+)$/.exec(dataUrl);
  return match ? match[1] : null;
}

export async function POST(request: Request) {
  const body = await request.json();
  const image = typeof body?.image === "string" ? body.image : null;
  if (!image) {
    return NextResponse.json({ error: "Missing image" }, { status: 400 });
  }

  const base64 = parseDataUrl(image);
  if (!base64) {
    return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
  }

  let ollamaResponse: Response;
  try {
    ollamaResponse = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        prompt:
          "Identify what is shown in this photo. If it is a fruit, assess whether it looks fresh based on visible cues like color, texture, spots, bruising, or mold. Respond with a JSON object matching the given schema.",
        images: [base64],
        format: RESULT_SCHEMA,
        stream: false,
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Couldn't reach Ollama. Is it running? (`ollama serve`)" },
      { status: 503 },
    );
  }

  if (!ollamaResponse.ok) {
    const text = await ollamaResponse.text();
    return NextResponse.json(
      { error: `Ollama error: ${text || ollamaResponse.statusText}` },
      { status: 502 },
    );
  }

  const data = await ollamaResponse.json();
  const result = JSON.parse(data.response) as AnalysisResult;
  return NextResponse.json(result);
}
