import { NextRequest, NextResponse } from "next/server";
import { getEntitlementInfo } from "@/lib/entitlement";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "session_id required" },
        { status: 400 }
      );
    }

    const info = await getEntitlementInfo(sessionId);

    return NextResponse.json({
      success: true,
      data: info,
    });
  } catch (error) {
    console.error("Entitlement status error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
