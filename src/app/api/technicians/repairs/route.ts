import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import Repair from "@/models/repair";

export async function GET() {
  try {
    await connectDB();

    const technicians = await User.find({
      roles: "technician",
    }).select("_id username");

    const result = [];

    for (const tech of technicians) {
      const repairs = await Repair.find({
        technician: tech._id,
      })
        .sort({ createdAt: -1 })
        .lean();

      result.push({
        technician: tech,
        repairs,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error obteniendo técnicos" },
      { status: 500 }
    );
  }
}
