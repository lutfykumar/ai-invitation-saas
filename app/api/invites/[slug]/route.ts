import { NextRequest, NextResponse } from "next/server";
import { getInvitationBySlug, incrementInvitationViewCount } from "@/lib/db/utils";
import { invitationView } from "@/db/schema";
import { db } from "@/db";
import { nanoid } from "nanoid";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const invitation = await getInvitationBySlug(params.slug);

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found or not published" },
        { status: 404 }
      );
    }

    // Increment view count
    await incrementInvitationViewCount(invitation.id);

    // Track view (optional, for analytics)
    const clientIP = request.headers.get("x-forwarded-for") ||
                     request.headers.get("x-real-ip") ||
                     "unknown";

    const userAgent = request.headers.get("user-agent") || "unknown";

    try {
      await db.insert(invitationView).values({
        id: nanoid(),
        invitationId: invitation.id,
        ipAddress: clientIP,
        userAgent: userAgent,
        viewedAt: new Date(),
      });
    } catch (viewError) {
      // Don't fail the request if view tracking fails
      console.error("Error tracking view:", viewError);
    }

    return NextResponse.json(invitation);
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}