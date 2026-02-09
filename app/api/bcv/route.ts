import { NextResponse } from "next/server";

// Cache the rate for 1 hour to stay performant
export const revalidate = 3600; 

export async function GET() {
  try {
    // 1. Fetch the BCV landing page
    const res = await fetch("https://www.bcv.org.ve/", {
      // Basic bypass for some blocks
      headers: { "User-Agent": "Mozilla/5.0" },
      // Let Next cache this route response
      next: { revalidate },
    });

    if (!res.ok) throw new Error(`BCV responded with ${res.status}`);

    const html = await res.text();

    // 2. Extract the USD rate from the #dolar block.
    // We avoid extra dependencies by parsing with a conservative regex.
    const match = html.match(
      /id=["']dolar["'][\s\S]*?<strong[^>]*>\s*([^<]+?)\s*<\/strong>/i
    );
    const rawRate = match?.[1]?.trim().replace(",", ".");
    const rate = rawRate ? Number.parseFloat(rawRate) : Number.NaN;

    if (isNaN(rate)) throw new Error("Could not parse rate");

    return NextResponse.json({ 
      currency: 'USD',
      rate: rate,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("BCV Fetch Error:", error);
    // Fallback rate if the site is down (highly recommended for production)
    return NextResponse.json({ rate: 45.50, isFallback: true }, { status: 200 });
  }
}