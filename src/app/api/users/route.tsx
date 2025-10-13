import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import User from "@/models/user";

export async function GET() {
  await connectDB();
  const users = await User.find({}, "-password"); // excluye el hash
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { username, password, role } = await req.json();

    if (!username || !password || !role) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return NextResponse.json({ error: "Usuario ya existe" }, { status: 400 });
    }

    const hashed = await hashPassword(password);
    const newUser = await User.create({ username, password: hashed, role });

    return NextResponse.json({ message: "Usuario creado", user: newUser });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}
