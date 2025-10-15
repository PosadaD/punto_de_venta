// src/app/api/sales/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/product";
import Sale from "@/models/sale";
import Repair from "@/models/repair";

const TAX_RATE = Number(process.env.IVA_RATE || 0.16);

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { items, saleCode, user } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: "No hay items" }, { status: 400 });
    }

    if (!saleCode) {
      return NextResponse.json({ error: "saleCode es requerido" }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ error: "Usuario que realiza la venta requerido" }, { status: 400 });
    }

    // Obtener productos/servicios de DB
    const ids = items.map((i: any) => i.productId);
    const products = await Product.find({ _id: { $in: ids } });
    const map = new Map();
    products.forEach((p) => map.set(String(p._id), p));

    // Validaciones y cálculo de totales
    let total = 0;
    let totalNet = 0;
    let totalTax = 0;
    const saleItems: any[] = [];
    const servicesForRepair: any[] = [];

    for (const it of items) {
      const prod = map.get(String(it.productId));
      if (!prod)
        return NextResponse.json({ error: `Producto no encontrado ${it.productId}` }, { status: 404 });

      const qty = Number(it.qty);
      if (isNaN(qty) || qty <= 0)
        return NextResponse.json({ error: `Cantidad inválida para ${prod.title}` }, { status: 400 });

      const unitPrice = Number(it.unitPrice); // precio incluido IVA
      const lineTotal = unitPrice * qty;
      const netUnit = unitPrice / (1 + TAX_RATE);
      const taxUnit = unitPrice - netUnit;

      total += lineTotal;
      totalNet += netUnit * qty;
      totalTax += taxUnit * qty;

      if (prod.type === "service") {
        const serviceInfo = it.serviceInfo || {};
        saleItems.push({
          productId: prod._id,
          title: prod.title,
          code: prod.code,
          type: prod.type,
          qty,
          unitPrice,
          lineTotal,
          serviceInfo,
        });
        servicesForRepair.push({ prod, qty, serviceInfo });
      } else {
        if (prod.stock < qty)
          return NextResponse.json({ error: `Stock insuficiente para ${prod.title}` }, { status: 400 });

        saleItems.push({
          productId: prod._id,
          title: prod.title,
          code: prod.code,
          type: prod.type,
          qty,
          unitPrice,
          lineTotal,
        });
      }
    }

    // Actualizar stock de productos
    const ops: any[] = [];
    for (const it of items) {
      const prod = map.get(String(it.productId));
      if (prod.type === "product") {
        ops.push({
          updateOne: {
            filter: { _id: prod._id, stock: { $gte: Number(it.qty) } },
            update: { $inc: { stock: -Number(it.qty) } },
          },
        });
      }
    }
    if (ops.length) await Product.bulkWrite(ops);

    // Crear venta
    const sale = await Sale.create({
      items: saleItems,
      total,
      totalNet,
      totalTax,
      saleCode,
      user, // { userId, username }
      status: servicesForRepair.length ? "pending" : "completed",
    });

    // Crear reparaciones para servicios
    for (const s of servicesForRepair) {
      await Repair.create({
        saleId: sale._id,
        productId: s.prod._id,
        title: s.prod.title,
        code: s.prod.code,
        customer: {
          name: s.serviceInfo.customerName,
          phone: s.serviceInfo.customerPhone,
        },
        brand: s.serviceInfo.brand,
        model: s.serviceInfo.model,
        description: s.serviceInfo.description,
        status: "received",
      });
    }

    return NextResponse.json({ message: "Venta creada", sale });
  } catch (err: any) {
    console.error("Error creando venta", err);
    return NextResponse.json({ error: err.message || "Error servidor" }, { status: 500 });
  }
}

// GET opcional para listar ventas
export async function GET() {
  try {
    await connectDB();
    const sales = await Sale.find({}).sort({ createdAt: -1 }).limit(200);
    return NextResponse.json(sales);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error obteniendo ventas" }, { status: 500 });
  }
}
