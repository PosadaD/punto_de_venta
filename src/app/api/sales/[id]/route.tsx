import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Sale from "@/models/sale";
import Product from "@/models/product";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    const sale = await Sale.findById(id);
    if (!sale) return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });

    // Opcional: revertir stock de productos
    for (const item of sale.items) {
      if (item.type === "product") {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.qty } });
      }
    }

    await sale.deleteOne();
    return NextResponse.json({ message: "Venta eliminada" });
  } catch (err: any) {
    console.error("Error eliminando venta:", err);
    return NextResponse.json({ error: err.message || "Error servidor" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();
    const { items } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: "No hay items para actualizar" }, { status: 400 });
    }

    const sale = await Sale.findById(id);
    if (!sale) return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });

    // Recalcular totales
    const TAX_RATE = Number(process.env.IVA_RATE || 0.16);
    let total = 0;
    let totalNet = 0;
    let totalTax = 0;

    for (const it of items) {
      const lineTotal = it.qty * it.unitPrice;
      const netUnit = it.unitPrice / (1 + TAX_RATE);
      const taxUnit = it.unitPrice - netUnit;

      total += lineTotal;
      totalNet += netUnit * it.qty;
      totalTax += taxUnit * it.qty;
    }

    // Actualizar venta
    sale.items = items;
    sale.total = total;
    sale.totalNet = totalNet;
    sale.totalTax = totalTax;

    await sale.save();

    return NextResponse.json({ message: "Venta actualizada", sale });
  } catch (err: any) {
    console.error("Error actualizando venta:", err);
    return NextResponse.json({ error: err.message || "Error servidor" }, { status: 500 });
  }
}
