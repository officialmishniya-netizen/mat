import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fraudSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const existing = await db.query.fraudSettings.findFirst();
    if (existing) {
      await db.update(fraudSettings).set({ ...body, updatedAt: new Date() }).where(eq(fraudSettings.id, 1));
    } else {
      await db.insert(fraudSettings).values({ id: 1, ...body });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Fraud settings save error:", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
