import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // Rutas que no requieren autenticación
  const publicPaths = ["/login", "/api/login"];

  if (publicPaths.includes(pathname)) {
    // Si ya hay token y entra al login, lo redirigimos al dashboard
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Si no hay token y la ruta no es pública → redirige al login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // Verifica que el token sea válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // Guarda la info del usuario en las cabeceras (para el servidor)
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-role", (decoded as any).role);
    requestHeaders.set("x-user-id", (decoded as any).id);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err) {
    console.error("❌ Token inválido o expirado:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// Aplica el middleware a todo excepto los assets y APIs públicas
export const config = {
  matcher: [
    "/dashboard/:path*",  // protege todas las páginas bajo /dashboard
    "/api/:path*",        // protege tus APIs
    "/",                  // protege la raíz si redirige al dashboard
  ],
};
