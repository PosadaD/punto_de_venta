import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import User from "@/models/user";

// GET: listar todos los usuarios
export async function GET() {
  await connectDB();
  const users = await User.find({}, "-password"); // No devolver password
  return NextResponse.json(users);
}

// POST: crear nuevo usuario
export async function POST(req: Request) {
  await connectDB();
  const { username, password, role } = await req.json();

  if (!username || !password || !role) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const hashed = await hashPassword(password);
  const newUser = await User.create({ username, password: hashed, role });
  return NextResponse.json(newUser);
}
