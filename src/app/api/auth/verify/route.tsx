// src/app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const token = cookieHeader.split("; ").find((c) => c.startsWith("token="))?.split("=")[1];

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload: any = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Normalizar el user object que devolveremos
    const roles = Array.isArray(payload.roles) ? payload.roles : payload.role ? [payload.role] : [];
    const user = {
      id: payload.id || payload.userId || payload._id,
      username: payload.username,
      roles,
    };

    return NextResponse.json({ authenticated: true, user });
  } catch (err) {
    console.error("Error verifying token:", err);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
