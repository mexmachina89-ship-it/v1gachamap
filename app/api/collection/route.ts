export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: コレクション一覧
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ items: [] }, { status: 401 });

  const items = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ items });
}

// POST: 追加
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { itemName, itemUrl, imageUrl, source, totalTypes, ownedTypes, memo } = body;
  if (!itemName || !itemUrl) return NextResponse.json({ error: "invalid" }, { status: 400 });

  try {
    const item = await prisma.collection.upsert({
      where: { userId_itemUrl: { userId, itemUrl } },
      update: { ownedTypes: ownedTypes ?? 1, totalTypes, memo },
      create: {
        userId, itemName, itemUrl, imageUrl,
        source: source || "unknown",
        totalTypes: totalTypes ?? null,
        ownedTypes: ownedTypes ?? 1,
        memo,
      },
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}

// PATCH: 所持数更新
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ownedTypes, memo } = body;
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  const item = await prisma.collection.updateMany({
    where: { id, userId },
    data: {
      ...(ownedTypes !== undefined ? { ownedTypes } : {}),
      ...(memo !== undefined ? { memo } : {}),
    },
  });
  return NextResponse.json({ ok: true, count: item.count });
}

// DELETE: 削除
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  await prisma.collection.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
