import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/product";

// ✅ Crear producto
export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    const product = await Product.create(data);
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creando producto:", error);
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 });
  }
}

// Obtener todos los productos (con filtro opcional por título o código)
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    let filter = {};
    if (q) {
      filter = {
        $or: [
          { title: { $regex: q, $options: "i" } },
          { code: { $regex: q, $options: "i" } },
        ],
      };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}
