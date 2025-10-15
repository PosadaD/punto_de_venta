import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import User from "@/models/user";

//Actualizar usuario
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { username, password, roles } = await req.json();

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Actualiza los campos enviados
    if (username) user.username = username;
    if (roles) user.roles = roles;
    if (password) {
      user.password = await hashPassword(password);
    }

    await user.save();

    return NextResponse.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error actualizando usuario:", error);
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  }
}

// Eliminar usuario
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    await User.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error("❌ Error eliminando usuario:", error);
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 });
  }
}
