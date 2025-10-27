import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function getCurrentUser(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return session?.user || null;
}

export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}