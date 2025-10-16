import mongoose, { Schema } from "mongoose";

const RepairSchema = new Schema(
  {
    saleId: { type: Schema.Types.ObjectId, ref: "Sale", required: true },
    saleCode: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    code: { type: String, required: false },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
    },
    brand: String,
    model: String,
    description: String,
    status: {
      type: String,
      enum: ["received", "in_progress", "completed", "delivered"],
      default: "received",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Repair || mongoose.model("Repair", RepairSchema);
