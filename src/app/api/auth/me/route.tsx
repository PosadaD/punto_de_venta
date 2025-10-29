// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  // Normalizamos los roles (puede venir como `role` string o `roles` array)
  const roles: string[] = Array.isArray(payload.roles)
    ? payload.roles
    : payload.role
    ? [payload.role]
    : [];

  return NextResponse.json({
    user: {
      id: payload.id || payload.userId || payload._id,
      username: payload.username,
      email: payload.email,
      roles,
    },
  });
}
