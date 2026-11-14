import { NextRequest, NextResponse } from "next/server";
import { predictTransactionCategory } from "@/lib/ai/categorizer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchant, description, amount } = body;

    const result = predictTransactionCategory(merchant, description, amount ? parseFloat(amount) : undefined);

    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
