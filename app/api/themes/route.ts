import { NextRequest, NextResponse } from "next/server";
import { getThemes } from "@/lib/db/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    const themes = await getThemes(categoryId || undefined);

    return NextResponse.json(themes);
  } catch (error) {
    console.error("Error fetching themes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}