import { NextResponse } from "next/server";

// Placeholder only. Freshness detection approach (fine-tuned model vs. a
// vision API) is still being evaluated — see project memory.
export async function POST() {
  return NextResponse.json(
    { error: "Freshness detection is not implemented yet." },
    { status: 501 },
  );
}
