export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getUserId(req: NextRequest): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.id ?? null;
}

// GET: ウィッシュリスト一覧
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ items: [] }, { status: 401 });

  const items = await prisma.wishlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}

// POST: 追加
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { itemName, itemUrl, imageUrl, price, source, memo } = body;
  if (!itemName || !itemUrl) return NextResponse.json({ error: "invalid" }, { status: 400 });

  try {
    const item = await prisma.wishlist.upsert({
      where: { userId_itemUrl: { userId, itemUrl } },
      update: { memo },
      create: { userId, itemName, itemUrl, imageUrl, price, source: source || "unknown", memo },
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}

// DELETE: 削除
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  await prisma.wishlist.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
