import mongoose, { Schema } from "mongoose";

const expenseSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["fixed", "variable"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    description: String,
    category: {
      type: String,
      default: "General",
    },
    createdBy: {
      type: String, // guarda el nombre o id del usuario
    },
  },
  { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
