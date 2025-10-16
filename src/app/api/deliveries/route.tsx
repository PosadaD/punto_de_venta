import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Repair from "@/models/repair";

// Listar solo los repairs completados
export async function GET() {
  try {
    await connectDB();
    const deliveries = await Repair.find({ status: "completed" }).sort({ updatedAt: -1 });
    return NextResponse.json(deliveries);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Error obteniendo entregas" }, { status: 500 });
  }
}

// Actualizar estado a "delivered"
export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID de reparación requerido" }, { status: 400 });
    }

    const repair = await Repair.findById(id);
    if (!repair) return NextResponse.json({ error: "Reparación no encontrada" }, { status: 404 });

    // Solo se permite cambiar de "completed" a "delivered"
    if (repair.status !== "completed") {
      return NextResponse.json({ error: "Solo se pueden entregar los servicios completados" }, { status: 400 });
    }

    repair.status = "delivered";
    await repair.save();

    return NextResponse.json({ message: "Reparación entregada", repair });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Error servidor" }, { status: 500 });
  }
}
