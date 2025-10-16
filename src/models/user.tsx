import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: {
    type: [String],
    enum: ["admin", "sales", "inventory", "finance", "technician", "delivery"],
    default: ["sales"],
  },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
