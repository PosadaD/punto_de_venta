// src/lib/jwt.ts
import jwt, { JwtPayload, Secret } from "jsonwebtoken";

const SECRET: Secret = process.env.JWT_SECRET || "default_secret_key";

// 🔧 Normaliza el payload para mantener consistencia en roles y usuario
function normalizeUserPayload(payload: any) {
  const roles =
    Array.isArray(payload.roles) && payload.roles.length
      ? payload.roles
      : payload.role
      ? [payload.role]
      : [];

  return {
    id: payload.id || payload._id || payload.userId,
    username: payload.username,
    roles,
  };
}

// ✅ Firma un token JWT correctamente con jsonwebtoken@9 y TypeScript
export function signToken(payload: object, expiresIn: string | number = "1d"): string {
  const cleanPayload = normalizeUserPayload(payload);

  if (process.env.NODE_ENV !== "production") {
    console.log("🟢 [JWT] Firmando token con payload:", cleanPayload);
  }

  // ⚠️ En jsonwebtoken@9, el tercer argumento no puede tiparse directamente con SignOptions
  // Se soluciona usando un objeto literal sin declarar tipo
  return jwt.sign(cleanPayload, SECRET, { expiresIn: expiresIn as any });
}

// ✅ Verifica un token y devuelve los datos decodificados normalizados
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET) as JwtPayload;
    const normalized = normalizeUserPayload(decoded);

    if (process.env.NODE_ENV !== "production") {
      console.log("🟣 [JWT] Token verificado correctamente:", normalized);
    }

    return normalized;
  } catch (err: any) {
    if (process.env.NODE_ENV !== "production") {
      console.error("🔴 [JWT] Error verificando token:", err.message);
    }
    return null;
  }
}

// ✅ Solo decodifica el token sin verificarlo (por ejemplo, para debugging)
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
}
