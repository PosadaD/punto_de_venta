import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  title: string;
  code: string;
  purchaseDate: Date;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  type: "product" | "service"; // Para manejar servicios más adelante
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    purchaseDate: { type: Date, required: true },
    purchasePrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    type: { type: String, enum: ["product", "service"], default: "product" },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
