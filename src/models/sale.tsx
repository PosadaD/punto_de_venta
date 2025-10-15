import mongoose, { Schema } from "mongoose";

const SaleItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  title: { type: String, required: true },
  code: { type: String, required: true },
  type: { type: String, enum: ["product", "service"], default: "product" },
  qty: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  lineTotal: { type: Number, required: true },
  // Campos extra para servicios
  customer: {
    name: String,
    phone: String,
  },
  brand: String,
  model: String,
  description: String,
});

const SaleSchema = new Schema(
  {
    saleCode: { type: String, required: true, unique: true },
    items: [SaleItemSchema],
    total: { type: Number, required: true },
    totalNet: { type: Number, required: true },
    totalTax: { type: Number, required: true },
    user: {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      username: { type: String, required: true },
    },
    status: { type: String, enum: ["completed", "pending"], default: "completed" },
  },
  { timestamps: true }
);

export default mongoose.models.Sale || mongoose.model("Sale", SaleSchema);
