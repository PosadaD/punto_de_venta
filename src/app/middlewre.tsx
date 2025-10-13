import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET as string;

// Define qué roles pueden acceder a cada ruta
const rolePermissions: Record<string, string[]> = {
  "/dashboard/users": ["admin"],
  "/dashboard/reports": ["admin"],
  "/dashboard/expenses": ["admin", "finance"],
  "/dashboard/inventory": ["admin", "inventory"],
  "/dashboard/sales": ["admin", "sales"],
};

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // Si no hay token y no está en /login → redirigir al login
  if (!token && !req.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Permitir acceso al login sin token
  if (req.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  try {
    const decoded = jwt.verify(token!, SECRET_KEY) as { role: string };

    const userRole = decoded.role;
    const path = req.nextUrl.pathname;

    // Busca coincidencias con las rutas configuradas
    for (const [route, allowedRoles] of Object.entries(rolePermissions)) {
      if (path.startsWith(route)) {
        if (!allowedRoles.includes(userRole)) {
          // Si el rol no tiene permiso, redirige al dashboard general
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
    }

    // Todo OK → continuar
    return NextResponse.next();
  } catch (error) {
    console.error("Error en middleware:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// Define a qué rutas aplica el middleware
export const config = {
  matcher: ["/dashboard/:path*"],
};
