// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Asegúrate de haber definido JWT_SECRET en .env y reiniciar el dev server
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_fallback";
const encoder = new TextEncoder();
const secret = encoder.encode(JWT_SECRET);

// Rutas y roles permitidos
const rolePermissions: Record<string, string[]> = {
  "/dashboard/users": ["admin"],
  "/dashboard/reports": ["admin"],
  "/dashboard/expenses": ["admin", "finance"],
  "/dashboard/inventory": ["admin", "inventory"],
  "/dashboard/sales": ["admin", "sales"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignorar recursos estáticos y rutas internas
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Permitir acceso libre a la raíz y login
  if (pathname === "/" || pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // Obtener token desde la cookie (si existe)
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // Verifica token con jose (compatible en Edge)
    const { payload } = await jwtVerify(token, secret);
    // payload puede contener { id, username, role, iat, exp }
    const userRole = (payload as any).role as string | undefined;

    // Si no viene rol, forzar logout
    if (!userRole) {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("token");
      return res;
    }

    // Comprobar permisos por ruta
    for (const [route, allowed] of Object.entries(rolePermissions)) {
      if (pathname.startsWith(route) && !allowed.includes(userRole)) {
        // Usuario no autorizado para esta subruta -> enviar al dashboard principal
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Todo ok: permitir
    return NextResponse.next();
  } catch (err) {
    // Token inválido o expirado
    console.error("Middleware - token inválido:", err);
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("token");
    return res;
  }
}

// Aplicar middleware a las rutas del dashboard
export const config = {
  matcher: ["/dashboard/:path*", "/dashboard"],
};
