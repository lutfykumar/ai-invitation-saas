import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/api-middleware";
import { getUserInvitations, createInvitation } from "@/lib/db/utils";
import { createInvitationSchema } from "@/lib/validations/invitation";
import { nanoid } from "nanoid";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const invitations = await getUserInvitations(user.id);

    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createInvitationSchema.parse(body);

    // Generate unique slug
    const slug = `${nanoid(8)}-${Date.now()}`;

    const invitation = await createInvitation({
      ...validatedData,
      slug,
      userId: user.id,
    });

    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    console.error("Error creating invitation:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}