import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { adjustments } from "../../../db/schema";

export async function GET() {
  try {
    const rows = await getDb().select().from(adjustments).orderBy(desc(adjustments.createdAt), desc(adjustments.id)).limit(100);
    return Response.json({ adjustments: rows });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load adjustment history." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { pieceId?: string; location?: string; quantity?: number; memo?: string };
    const pieceId = body.pieceId?.trim() ?? "";
    const location = body.location?.trim() ?? "";
    const memo = body.memo?.trim() ?? "";
    const quantity = Number(body.quantity);
    if (!pieceId || !location || !memo || !Number.isInteger(quantity) || quantity === 0) {
      return Response.json({ error: "Complete every field and use a non-zero quantity." }, { status: 400 });
    }
    const normalizedPartNumber = pieceId.toUpperCase();
    const [adjustment] = await getDb().insert(adjustments).values({ pieceId: normalizedPartNumber, pieceName: normalizedPartNumber, location, quantity, memo }).returning();
    return Response.json({ adjustment }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save adjustment." }, { status: 500 });
  }
}
