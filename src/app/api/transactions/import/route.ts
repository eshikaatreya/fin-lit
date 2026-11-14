import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActiveUser } from "@/lib/auth-helper";
import { parseBankStatementCSV } from "@/lib/passbook/statement-importer";

export async function POST(request: NextRequest) {
  try {
    const user = await getActiveUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { csvContent, filename = "statement.csv" } = body;

    if (!csvContent || typeof csvContent !== "string") {
      return NextResponse.json({ error: "No CSV content provided." }, { status: 400 });
    }

    // 1. Fetch existing idempotency keys for this user
    const existingTx = await prisma.transaction.findMany({
      where: { userId: user.id },
      select: { idempotencyKey: true },
    });
    const existingKeys = new Set(existingTx.map((t) => t.idempotencyKey).filter(Boolean) as string[]);

    // 2. Parse CSV
    const parsed = parseBankStatementCSV(csvContent, user.id, existingKeys);

    if (parsed.validRows.length === 0) {
      return NextResponse.json({
        success: false,
        importedCount: 0,
        duplicatesCount: parsed.duplicatesCount,
        errors: parsed.errors.length ? parsed.errors : ["No new valid transactions found."],
      });
    }

    // 3. Cache system categories
    const categories = await prisma.transactionCategory.findMany();
    const catMap = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
    const defaultCatId = catMap.get("miscellaneous") || categories[0]?.id;

    // 4. Batch insert parsed transactions
    let insertedCount = 0;
    for (const row of parsed.validRows) {
      const catId = catMap.get(row.suggestedCategory.toLowerCase()) || defaultCatId;

      await prisma.transaction.create({
        data: {
          userId: user.id,
          amount: row.amount,
          type: row.type,
          date: row.date,
          merchant: row.merchant,
          description: row.description,
          categoryId: catId,
          paymentMethod: row.paymentMethod,
          referenceId: row.referenceId,
          idempotencyKey: row.idempotencyKey,
          status: "COMPLETED",
          aiSuggestedCategory: row.suggestedCategory,
          userConfirmedCategory: true,
        },
      });
      insertedCount++;
    }

    // 5. Log statement import
    await prisma.importedStatement.create({
      data: {
        userId: user.id,
        filename,
        sourceFormat: "CSV",
        importedCount: insertedCount,
        duplicateCount: parsed.duplicatesCount,
      },
    });

    return NextResponse.json({
      success: true,
      importedCount: insertedCount,
      duplicatesCount: parsed.duplicatesCount,
      errors: parsed.errors,
    });
  } catch (error: any) {
    console.error("Statement import error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
