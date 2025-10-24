import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Repair from "@/models/repair";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    const updated = await Repair.findByIdAndUpdate(id, body, { new: true });
    if (!updated)
      return NextResponse.json({ error: "Reparación no encontrada" }, { status: 404 });

    return NextResponse.json({ message: "Reparación actualizada", repair: updated });
  } catch (err: any) {
    console.error("Error al actualizar reparación:", err);
    return NextResponse.json({ error: err.message || "Error servidor" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    const repair = await Repair.findById(id);
    if (!repair) return NextResponse.json({ error: "Reparación no encontrada" }, { status: 404 });

    await repair.deleteOne();
    return NextResponse.json({ message: "Reparación eliminada" });
  } catch (err: any) {
    console.error("Error eliminando reparación:", err);
    return NextResponse.json({ error: err.message || "Error servidor" }, { status: 500 });
  }
}



export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();

  try {
    const repair = await Repair.findById(id);

    if (!repair) {
      return NextResponse.json(
        { error: "Reparación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(repair, { status: 200 });
  } catch (error) {
    console.error("Error al obtener la reparación:", error);
    return NextResponse.json(
      { error: "Error al obtener la reparación" },
      { status: 500 }
    );
  }
}


export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await context.params;

  try {
    const body = await req.json();

    const repair = await Repair.findByIdAndUpdate(id, body, { new: true });

    if (!repair) {
      return NextResponse.json({ error: "Reparación no encontrada" }, { status: 404 });
    }

    return NextResponse.json(repair, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar la reparación:", error);
    return NextResponse.json(
      { error: "Error al actualizar la reparación"},
      { status: 500 }
    );
  }
}


