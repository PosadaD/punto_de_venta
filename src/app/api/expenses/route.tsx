import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Expense from "@/models/expense";


// GET - obtener todos los gastos
export async function GET() {
  try {
    await connectDB();
    const expenses = await Expense.find().sort({ date: -1 });
    return NextResponse.json(expenses);
  } catch (err: any) {
    console.error("Error al obtener gastos:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - agregar un gasto nuevo
export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    const expense = await Expense.create(data);
    return NextResponse.json(expense);
  } catch (err: any) {
    console.error("Error al crear gasto:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - eliminar un gasto
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    await Expense.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error al eliminar gasto:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
