import mongoose, { Schema } from "mongoose";

const RepairSchema = new Schema(
  {
    saleId: {
      type: Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
    },

    saleCode: { type: String, required: true },

    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    title: { type: String, required: true },
    code: { type: String },

    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
    },

    brand: {type: String},
    model: {type: String},
    password: {type: String},
    description: {type: String},

    technician: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    deposit: {
      type: Number,
      default: 0,
    },

    remainingBalance: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["received", "in_progress", "completed", "delivered"],
      default: "received",
    },

    revision: String,
  },
  { timestamps: true }
);

export default mongoose.models.Repair || mongoose.model("Repair", RepairSchema);
