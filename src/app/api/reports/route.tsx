import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Sale from "@/models/sale";
import Expense from "@/models/expense";
import Product from "@/models/product";
import Repair from "@/models/repair";

const TAX_RATE = Number(process.env.IVA_RATE || 0.16);

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const dateFilter: any = {};
    if (from && to) {
      dateFilter.createdAt = { $gte: new Date(from), $lte: new Date(to) };
    }

    // Ventas completadas (servicios entregados y productos)
    const sales = await Sale.find({ ...dateFilter, status: "completed" });
    const repairs = await Repair.find({ status: "delivered", ...dateFilter });

    // Incluimos reparaciones entregadas (servicios terminados)
    const serviceSales = repairs.length;

    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const totalNet = sales.reduce((sum, s) => sum + s.totalNet, 0);
    const totalIVA = sales.reduce((sum, s) => sum + s.totalTax, 0);

    // Calcular costo de los productos vendidos
    let totalCost = 0;
    for (const s of sales) {
      for (const item of s.items) {
        const product = await Product.findById(item.productId);
        if (product && product.type === "product") {
          totalCost += product.purchasePrice * item.qty;
        }
      }
    }

    // Gastos fijos y variables
    const expenses = await Expense.find(dateFilter);
    const fixedExpenses = expenses.filter((e) => e.type === "fixed");
    const variableExpenses = expenses.filter((e) => e.type === "variable");

    const totalFixed = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalVariable = variableExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = totalFixed + totalVariable;

    // Cálculos finales
    const grossProfit = totalSales - totalCost; // utilidad bruta
    const netProfit = grossProfit - totalExpenses; // utilidad neta

    const summary = {
      totalSales,
      totalIVA,
      totalNet,
      totalCost,
      grossProfit,
      totalExpenses,
      totalFixed,
      totalVariable,
      netProfit,
      serviceSales,
      period: { from, to },
    };

    return NextResponse.json(summary);
  } catch (err: any) {
    console.error("Error al generar reporte:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
