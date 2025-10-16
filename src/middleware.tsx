// src/middleware.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export function middleware(req: NextRequest) {
  const cookieToken = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // Rutas públicas
  const publicPaths = [
    "/login",
    "/api/auth/login",
    "/api/auth/verify",
    "/api/auth/logout",
  ];
  
  if (publicPaths.includes(pathname)) {
    // si ya está logueado y entra a login, lo mandamos al dashboard
    if (cookieToken && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Si no hay token → redirigir al login
  if (!cookieToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Verificar token
  const payload: any = verifyToken(cookieToken);
  if (!payload) {
    //console.log("Middleware: token inválido/expirado");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Normalizar roles: payload.roles (array) o payload.role (string)
  const roles: string[] = Array.isArray(payload.roles)
    ? payload.roles
    : payload.role
    ? [payload.role]
    : [];

  //console.log("✅ Middleware - PATH:", pathname);
  //console.log("✅ Middleware - JWT payload:", payload);
  console.log("✅ Middleware - roles:", roles);

  // Inyectar headers con info básica del usuario
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", String(payload.id || payload.userId || payload._id || ""));
  requestHeaders.set("x-user-name", String(payload.username || ""));
  requestHeaders.set("x-user-roles", JSON.stringify(roles));

  // Si la ruta es exactamente /dashboard → permitir acceso a todos los usuarios autenticados
  if (pathname === "/dashboard") {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Si la ruta está dentro de /dashboard/something → controlar por segmento
  if (pathname.startsWith("/dashboard/")) {
    const segment = pathname.split("/")[2] || ""; // 'users', 'sales', 'inventory', etc.

    // Si no hay segmento específico (ruta /dashboard/), permitir acceso
    if (!segment) {
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    // Definimos permisos por segmento (solo para sub-rutas específicas)
    const roleAccess: Record<string, string[]> = {
      users: ["admin"],
      sales: ["admin", "sales"],
      inventory: ["admin", "inventory"],
      expenses: ["admin", "finance"],
      repairs: ["admin", "technician"],
      reports: ["admin"],
    };

    const allowed = roleAccess[segment];

    // Si no hay regla para ese segmento, permitir acceso (nuevo comportamiento)
    if (!allowed) {
      //console.log(`Middleware: no hay reglas para segmento="${segment}", acceso permitido`);
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    // Comprueba intersección entre roles del usuario y allowed
    const hasAccess = roles.some((r) => allowed.includes(r));
    //console.log(`Middleware: segmento="${segment}" allowed=${JSON.stringify(allowed)} hasAccess=${hasAccess}`);

    if (!hasAccess) {
      // Si no tiene permisos, redirigir al dashboard principal
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Si no es /dashboard → permitir
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  // Aplica el middleware a todas las rutas del dashboard y raíz
  matcher: ["/dashboard/:path*", "/"],
};