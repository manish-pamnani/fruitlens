import { NextResponse } from "next/server";
import type { AnalysisResult } from "@/lib/analysis";

const OLLAMA_HOST = process.env.OLLAMA_HOST ?? "http://localhost:11434";
const MODEL = "qwen2.5vl:7b";

// Forcing a strict field-by-field JSON schema (Ollama's grammar-constrained
// "format") measurably hurt this small model's accuracy — e.g. it called a
// real mango "not a fruit" under the strict schema, but correctly identified
// it (variety included) once allowed to reason before answering. Loose
// `format: "json"` (valid-JSON-only, no field grammar) plus an explicit
// "think it through" prompt fixed it.
const PROMPT = `Look at this photo and think through what it shows: what object is it, and if it is a fruit, what species/variety, and how ripe or fresh does it look based on color, texture, spots, bruising, or mold. Do not be confidently wrong about ripeness, since eating an unripe or spoiled fruit can cause real harm.

Respond with a JSON object with these exact keys:
- label (string): common name, and variety if identifiable (e.g. "Alphonso Mango")
- isFruit (boolean): true only if it is a fruit, not a vegetable, grain, or unrelated object
- freshness (one of "fresh", "not_fresh", "unknown"): only meaningful when isFruit is true
- explanation (string): one or two sentences on your reasoning`;

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
        prompt: PROMPT,
        images: [base64],
        format: "json",
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
