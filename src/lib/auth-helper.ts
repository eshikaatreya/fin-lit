// Fin-Lit Active User & Session Resolution Helper
import { NextRequest } from "next/server";
import prisma from "./prisma";

export async function getActiveUser(request?: NextRequest) {
  // 1. Check query param or header
  const urlUserId = request ? new URL(request.url).searchParams.get("userId") : null;
  const headerUserId = request ? request.headers.get("x-user-id") : null;
  const cookieUserId = request ? request.cookies.get("finlit_user_id")?.value : null;

  const targetId = urlUserId || headerUserId || cookieUserId;

  if (targetId) {
    const user = await prisma.user.findUnique({
      where: { id: targetId },
      include: {
        userProfile: true,
        financialProfile: true,
      },
    });
    if (user) return user;
  }

  // Fallback to first seeded user (Aarav Sharma)
  const defaultUser = await prisma.user.findFirst({
    where: { email: "aarav.sharma@finlit.in" },
    include: {
      userProfile: true,
      financialProfile: true,
    },
  });

  if (defaultUser) return defaultUser;

  // Final fallback to any user
  return prisma.user.findFirst({
    include: {
      userProfile: true,
      financialProfile: true,
    },
  });
}
