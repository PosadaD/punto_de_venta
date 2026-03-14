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

      if (!user) {
        return NextResponse.json(
          { error: "Usuario que realiza la venta requerido" },
          { status: 400 }
        );
      }

      const generatedSaleCode = saleCode || `S-${Date.now()}`;

      const ids = items.map((i: any) => i.productId);
      const products = await Product.find({ _id: { $in: ids } });

      const map = new Map();
      products.forEach((p) => map.set(String(p._id), p));

      let total = 0;
      let totalNet = 0;
      let totalTax = 0;
      let paid = 0;

      const saleItems: any[] = [];
      const servicesForRepair: any[] = [];

      for (const it of items) {
        const prod = map.get(String(it.productId));
        if (!prod) {
          return NextResponse.json(
            { error: `Producto no encontrado ${it.productId}` },
            { status: 404 }
          );
        }

        const qty = Number(it.qty);
        const unitPrice = Number(it.unitPrice);

        if (isNaN(qty) || qty <= 0) {
          return NextResponse.json(
            { error: `Cantidad inválida para ${prod.title}` },
            { status: 400 }
          );
        }

        const lineTotal = unitPrice * qty;
        const netUnit = unitPrice / (1 + TAX_RATE);
        const taxUnit = unitPrice - netUnit;

        total += lineTotal;
        totalNet += netUnit * qty;
        totalTax += taxUnit * qty;

        if (prod.type === "service") {
          const serviceInfo = it.serviceInfo || {};

          if (!serviceInfo.technicianId) {
            return NextResponse.json(
              { error: "Técnico requerido para el servicio" },
              { status: 400 }
            );
          }

          const deposit = Number(serviceInfo.deposit || 0);

          if (deposit > lineTotal) {
            return NextResponse.json(
              { error: "El anticipo no puede ser mayor al total del servicio" },
              { status: 400 }
            );
          }

          paid += deposit;

          saleItems.push({
            productId: prod._id,
            title: prod.title,
            code: prod.code,
            type: prod.type,
            qty,
            unitPrice,
            lineTotal,
            customer: {
              name: serviceInfo.customerName,
              phone: serviceInfo.customerPhone,
            },
            brand: serviceInfo.brand,
            model: serviceInfo.model,
            description: serviceInfo.description,
          });

          servicesForRepair.push({
            prod,
            qty,
            unitPrice,
            lineTotal,
            serviceInfo,
            deposit,
          });
        } else {
          if (prod.stock < qty) {
            return NextResponse.json(
              { error: `Stock insuficiente para ${prod.title}` },
              { status: 400 }
            );
          }

          paid += lineTotal;

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

      const balance = total - paid;

      // Actualizar stock
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
        paid,
        balance,
        saleCode: generatedSaleCode,
        user,
        status: balance > 0 ? "pending" : "completed",
      });

      // Crear reparaciones
      for (const s of servicesForRepair) {
        const remainingBalance = s.lineTotal - s.deposit;

        await Repair.create({
          saleId: sale._id,
          saleCode: generatedSaleCode,
          productId: s.prod._id,
          title: s.prod.title,
          code: s.prod.code,
          customer: {
            name: s.serviceInfo.customerName,
            phone: s.serviceInfo.customerPhone,
          },
          brand: s.serviceInfo.brand,
          model: s.serviceInfo.model,
          password: s.serviceInfo.password,
          description: s.serviceInfo.description,
          technician: s.serviceInfo.technicianId,
          deposit: s.deposit,
          remainingBalance,
          status: "received",
        });
      }

      return NextResponse.json({
        message: "✅ Venta creada correctamente",
        sale,
      });
    } catch (err: any) {
      console.error("Error creando venta", err);
      return NextResponse.json(
        { error: err.message || "Error servidor" },
        { status: 500 }
      );
    }
  }



  export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const saleCode = searchParams.get("saleCode");
    const status = searchParams.get("status");

    const filter: any = {};

    if (saleCode) {
      filter.saleCode = { $regex: saleCode, $options: "i" };
    }

    if (status) {
      filter.status = status;
    }

    const sales = await Sale.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      total: sales.length,
      sales,
    });
  } catch (err: any) {
    console.error("Error obteniendo ventas", err);
    return NextResponse.json(
      { error: err.message || "Error servidor" },
      { status: 500 }
    );
  }
}