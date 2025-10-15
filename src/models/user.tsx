import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "sales", "inventory", "finance"],
    default: "sales",
  },
});

const User = models.User || mongoose.model("User", userSchema);
export default User;
