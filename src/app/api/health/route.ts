import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ database: "not_configured", ok: true });
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ database: "connected", ok: true });
  } catch {
    return NextResponse.json({ database: "error", ok: false }, { status: 503 });
  }
}
