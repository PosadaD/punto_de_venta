import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import { hashPassword } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const { username, password, role } = await req.json();

  const updateData: any = { username, role };
  if (password) updateData.password = await hashPassword(password);

  const updatedUser = await User.findByIdAndUpdate(params.id, updateData, { new: true });
  return NextResponse.json(updatedUser);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  await User.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
