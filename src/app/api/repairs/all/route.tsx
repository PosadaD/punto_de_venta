import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Repair from "@/models/repair";

export async function GET() {
  try {
    await connectDB();
    const repairs = await Repair.find({}).sort({ createdAt: -1 });
    return NextResponse.json(repairs);
  } catch (err: any) {
    console.error("Error obteniendo historial:", err);
    return NextResponse.json({ error: err.message || "Error servidor" }, { status: 500 });
  }
}
