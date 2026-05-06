import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { images } = await request.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    // Build content array with all images + prompt
    const content = [
      ...images.map(({ base64, mediaType }) => ({
        type: "image",
        source: { type: "base64", media_type: mediaType, data: base64 }
      })),
      {
        type: "text",
        text: `You are an expert product identifier specializing in luxury goods, sneakers, watches, electronics, and fashion.

You are given ${images.length} photo(s) of the same product from different angles. Use ALL photos together to identify the product as accurately as possible.

Respond ONLY with a JSON object (no markdown, no backticks):

{
  "brand": "brand name or Unknown",
  "model": "specific model name or Unknown",
  "category": "one of: Bags, Sneakers, Watches, Electronics, Clothing, Other",
  "confidence": number 0-100,
  "authentic_score": number 0-100,
  "authentic_verdict": "Low Risk or Medium Risk or High Risk or Cannot Determine",
  "authentic_reasons": ["reason1", "reason2", "reason3"],
  "suspicious_points": ["point1"] or [],
  "estimated_retail": "retail price range in USD",
  "estimated_resell": "resell price range in USD",
  "year": "approximate year/era or Unknown",
  "condition_hints": "brief condition assessment from images",
  "tips": "one practical tip for selling this item",
  "photos_used": ${images.length}
}

Important: authentic_verdict must be one of: Low Risk, Medium Risk, High Risk, Cannot Determine.
If confidence is below 30, set all fields to Unknown and explain in authentic_reasons.
Higher confidence is expected when multiple photos are provided.`
      }
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        messages: [{ role: "user", content }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json({ error: err?.error?.message || "API error" }, { status: response.status });
    }

    const data = await response.json();
    const raw = data.content?.find(b => b.type === "text")?.text || "";

    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    return NextResponse.json(parsed);

  } catch (err) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}