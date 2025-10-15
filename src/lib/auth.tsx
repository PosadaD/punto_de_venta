// src/lib/auth.ts
import bcrypt from "bcryptjs";

// 🔐 Encripta contraseña
export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// 🔍 Compara contraseña ingresada con hash guardado
export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

// ✅ Alias compatible con código existente
export async function verifyPassword(password: string, hashedPassword: string) {
  return await comparePassword(password, hashedPassword);
}
