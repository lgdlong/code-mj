import { jsonError, jsonOk } from "@/server/http";
import { prisma } from "@/server/prisma";

export async function GET() {
  try {
    // Real table query (not just SELECT 1) ensures Supabase Free Tier registers active DB usage.
    await prisma.user.count();
    return jsonOk({ status: "ok" });
  } catch (err) {
    console.error("[API:health]", err);
    return jsonError("Database unavailable", 503);
  }
}
