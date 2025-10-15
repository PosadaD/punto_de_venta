// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import { signToken } from "@/lib/jwt";
import { verifyPassword } from "@/lib/auth"; // asegúrate de tener esta función

export async function POST(req: Request) {
  try {
    await connectDB();
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    // Normaliza roles: si user.roles (array) usar roles, si no usar role (string)
    const payload: any = {
      id: user._id,
      username: user.username,
    };

    if (Array.isArray(user.roles)) {
      payload.roles = user.roles;
    } else if (user.role) {
      payload.role = user.role;
    }

    const token = signToken(payload);

    const res = NextResponse.json({ message: "Login ok" });

    // Set cookie (HTTP only)
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 día (segundos)
      sameSite: "lax",
    });

    return res;
  } catch (err: any) {
    console.error("Error en login:", err);
    return NextResponse.json({ error: "Error servidor" }, { status: 500 });
  }
}
