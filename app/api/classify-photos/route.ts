import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// Simple in-memory cache to avoid re-classifying the same photos
const cache = new Map<string, Record<number, string>>();

export async function POST(req: Request) {
  try {
    const { photos } = await req.json();

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json({ labels: {} });
    }

    // Cache key based on first 3 photo URLs
    const cacheKey = photos.slice(0, 3).join("|");
    if (cache.has(cacheKey)) {
      return NextResponse.json({ labels: cache.get(cacheKey) });
    }

    // Limit to 10 photos to control cost (each image costs tokens)
    const photoSubset = photos.slice(0, 10);

    if (!anthropic) {
      // Fallback: use URL-based heuristics when no API key
      const labels: Record<number, string> = {};
      for (let i = 0; i < photoSubset.length; i++) {
        const url = photoSubset[i].toLowerCase();
        if (url.includes("kitchen")) labels[i] = "Kitchen";
        else if (url.includes("bath")) labels[i] = "Bathroom";
        else if (url.includes("exterior") || url.includes("front")) labels[i] = "Exterior";
        else if (url.includes("yard") || url.includes("pool") || url.includes("patio")) labels[i] = "Yard";
        else if (url.includes("living")) labels[i] = "Living Room";
        else if (url.includes("bed")) labels[i] = "Bedroom";
        else if (url.includes("garage")) labels[i] = "Garage";
        else if (url.includes("dining")) labels[i] = "Dining Room";
      }
      cache.set(cacheKey, labels);
      return NextResponse.json({ labels });
    }

    // Build a single request with all photos as image URLs
    const content: Anthropic.Messages.ContentBlockParam[] = [
      {
        type: "text",
        text: `Classify each of these real estate listing photos. The photos are numbered in order. For each photo, provide a SHORT room/area label (e.g. "Kitchen", "Master Bathroom", "Exterior Front", "Backyard", "Living Room", "Bedroom", "Dining Room", "Garage", "Pool", "Laundry Room", "Staircase", "Entry", "Office"). Respond ONLY with a JSON object mapping the photo index to its label, like: {"0": "Kitchen", "1": "Exterior Front", "2": "Master Bathroom", ...}. No explanation, just the JSON.`,
      },
    ];

    // Download images and convert to base64 (Claude API can't fetch URLs blocked by robots.txt)
    const imagePromises = photoSubset.map(async (url: string, i: number) => {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) return null;
        const buf = Buffer.from(await res.arrayBuffer());
        const contentType = res.headers.get("content-type") || "image/jpeg";
        const mediaType = contentType.includes("png") ? "image/png" : contentType.includes("webp") ? "image/webp" : "image/jpeg";
        return { index: i, data: buf.toString("base64"), mediaType };
      } catch {
        return null;
      }
    });

    const images = (await Promise.all(imagePromises)).filter(Boolean) as { index: number; data: string; mediaType: string }[];

    if (images.length === 0) {
      return NextResponse.json({ labels: {} });
    }

    for (const img of images) {
      content.push({
        type: "image",
        source: { type: "base64", media_type: img.mediaType, data: img.data },
      } as any);
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{ role: "user", content }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as any).text)
      .join("");

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const labels: Record<number, string> = {};
      for (const [key, value] of Object.entries(parsed)) {
        labels[Number(key)] = String(value);
      }
      cache.set(cacheKey, labels);
      return NextResponse.json({ labels });
    }

    return NextResponse.json({ labels: {} });
  } catch (error) {
    console.error("[classify-photos] Error:", error);
    return NextResponse.json({ labels: {} });
  }
}
