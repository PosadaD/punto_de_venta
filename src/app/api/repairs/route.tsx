import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Repair from "@/models/repair";
import Sale from "@/models/sale";

// ✅ GET → Listar todas las reparaciones activas
export async function GET() {
  try {
    await connectDB();
    const repairs = await Repair.find({ status: { $nin: ["delivered", "completed"] } })
      .sort({ createdAt: -1 });
    return NextResponse.json(repairs);
  } catch (err: any) {
    console.error("Error obteniendo reparaciones:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ PATCH → Actualizar estado de una reparación
export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    const repair = await Repair.findByIdAndUpdate(id, { status }, { new: true });
    if (!repair) {
      return NextResponse.json({ error: "Reparación no encontrada" }, { status: 404 });
    }

    // Si el estado es "delivered", revisar si todas las reparaciones de la venta están entregadas
    if (status === "delivered") {
      const repairsOfSale = await Repair.find({ saleId: repair.saleId });
      const allDelivered = repairsOfSale.every(r => r.status === "delivered");

      if (allDelivered) {
        await Sale.findByIdAndUpdate(repair.saleId, { status: "completed" });
        console.log(`✅ Venta ${repair.saleId} marcada como completada`);
      }
    }

    return NextResponse.json(repair);
  } catch (err: any) {
    console.error("Error actualizando reparación:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
