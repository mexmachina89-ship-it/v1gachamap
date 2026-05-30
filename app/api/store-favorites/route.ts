export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: お気に入り店舗一覧
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ items: [] }, { status: 401 });

  const items = await prisma.storeFavorite.findMany({
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
  const { storeName, address, lat, lng, placeId, pinType, memo } = body;
  if (!storeName) return NextResponse.json({ error: "invalid" }, { status: 400 });

  try {
    const item = await prisma.storeFavorite.upsert({
      where: {
        userId_storeName_address: {
          userId,
          storeName,
          address: address ?? "",
        },
      },
      update: { memo },
      create: { userId, storeName, address, lat, lng, placeId, pinType, memo },
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

  await prisma.storeFavorite.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
