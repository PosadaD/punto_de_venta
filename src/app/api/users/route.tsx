import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import { hashPassword } from "@/lib/auth";

// ✅ Crear usuario
export async function POST(req: Request) {
  try {
    await connectDB();
    const { username, password, roles } = await req.json();

    if (!username || !password || !roles?.length) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      username,
      password: hashedPassword,
      roles,
    });

    return NextResponse.json(newUser);
  } catch (error: any) {
    console.error("Error creando usuario:", error);
    return NextResponse.json({ error: "Error creando usuario" }, { status: 500 });
  }
}

// ✅ Obtener lista de usuarios
export async function GET() {
  try {
    await connectDB();
    const users = await User.find({}, "-password"); // excluimos la contraseña
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Error obteniendo usuarios:", error);
    return NextResponse.json({ error: "Error obteniendo usuarios" }, { status: 500 });
  }
}
