import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const deleted = await User.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Usuario eliminado" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
