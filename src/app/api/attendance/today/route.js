//today/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const records = await prisma.attendance.findMany({
    where: { date: today },
    include: { employee: { select: { firstName: true, lastName: true, position: true } } },
  });

  return NextResponse.json(records);
}
