import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers"; 

export async function GET() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const payload = verifyToken(token);

  if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  return NextResponse.json({ user: payload });
}
