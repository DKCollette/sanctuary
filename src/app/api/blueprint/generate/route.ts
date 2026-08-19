import { NextRequest, NextResponse } from "next/server";
import { getTokenUser } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { generateBlueprint } from "@/lib/blueprint-engine";
import { geocodeCity, latLngToTimezone, birthToEpoch } from "@/lib/geocoding";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getTokenUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, date, time, timezone, city } = body;

    if (!fullName || !date || !time || !city) {
      return NextResponse.json(
        { error: "Full name, birth date, birth time, and birth city are required" },
        { status: 400 }
      );
    }

    // 1. Geocode city → lat/lng
    const geo = await geocodeCity(city);
    if (!geo) {
      return NextResponse.json({ error: "Could not find city. Try a larger city nearby." }, { status: 400 });
    }

    // 2. Detect timezone from lat/lng
    const detectedTz = timezone || latLngToTimezone(geo.lat, geo.lng);

    // 3. Convert to UTC epoch
    const birthEpoch = birthToEpoch(date, time, detectedTz);

    // 4. Build birth data
    const birthData = {
      fullName,
      date,
      time,
      timezone: detectedTz,
      utcOffset: 0, // Will be populated by spacetime
      location: { city: geo.displayName, lat: geo.lat, lng: geo.lng },
      birthEpoch,
    };

    // 5. Generate the blueprint
    const blueprint = await generateBlueprint(user.id, birthData);

    // 6. Store in database (upsert)
    await prisma.userBlueprint.upsert({
      where: { userId: user.id },
      create: { userId: user.id, blueprint: blueprint as any, version: 1 },
      update: { blueprint: blueprint as any, version: { increment: 1 } },
    });

    return NextResponse.json({ success: true, blueprint });
  } catch (err: any) {
    console.error("Blueprint generation error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate blueprint" }, { status: 500 });
  }
}