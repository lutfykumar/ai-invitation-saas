import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/api-middleware";
import { getInvitationById, updateInvitation, deleteInvitation } from "@/lib/db/utils";
import { updateInvitationSchema, publishInvitationSchema } from "@/lib/validations/invitation";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const invitation = await getInvitationById(params.id);

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check if user owns this invitation
    if (invitation.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // First check if invitation exists and user owns it
    const existingInvitation = await getInvitationById(params.id);

    if (!existingInvitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (existingInvitation.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Handle publish/unpublish separately
    if (Object.keys(body).length === 1 && "isPublished" in body) {
      const validatedData = publishInvitationSchema.parse(body);
      const updatedInvitation = await updateInvitation(params.id, validatedData);
      return NextResponse.json(updatedInvitation);
    }

    // Handle regular updates
    const validatedData = updateInvitationSchema.parse(body);
    const updatedInvitation = await updateInvitation(params.id, validatedData);

    return NextResponse.json(updatedInvitation);
  } catch (error) {
    console.error("Error updating invitation:", error);

    if (error instanceof z.ZodError) {
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // First check if invitation exists and user owns it
    const existingInvitation = await getInvitationById(params.id);

    if (!existingInvitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (existingInvitation.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await deleteInvitation(params.id, user.id);

    return NextResponse.json(
      { message: "Invitation deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}