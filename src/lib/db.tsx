import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Conectado a MongoDB Atlas");
  } catch (err) {
    console.error("Error de conexión a MongoDB:", err);
  }
};
