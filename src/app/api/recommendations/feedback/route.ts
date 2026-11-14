import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActiveUser } from "@/lib/auth-helper";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getActiveUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { recommendationId, rating, comment, action } = body;

    // 1. Log Feedback
    const feedback = await prisma.userFeedback.create({
      data: {
        userId: user.id,
        recommendationId: recommendationId || null,
        rating: rating || (action === "REJECT" ? "THUMBS_DOWN" : "THUMBS_UP"),
        comment: comment || (action ? `User ${action.toLowerCase()}ed the proposal` : null),
      },
    });

    // 2. If recommendationId is supplied, update recommendation status
    if (recommendationId) {
      await prisma.aIRecommendation.update({
        where: { id: recommendationId },
        data: {
          status: action === "REJECT" ? "REJECTED" : action === "ACCEPT" ? "ACCEPTED" : "PENDING",
          userFeedback: rating || action,
        },
      });
    }

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
