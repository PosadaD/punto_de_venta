export const runtime = "nodejs"; // ✅ fuerza el uso del runtime Node.js

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // Rutas públicas (sin protección)
  const publicPaths = ["/login", "/api/login"];

  if (publicPaths.includes(pathname)) {
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Si no hay token, redirige a login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Verifica token
  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch (err) {
    console.error("❌ Token inválido o expirado:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*", // protege todo el dashboard
    "/",                 // protege la raíz si redirige al dashboard
  ],
};
