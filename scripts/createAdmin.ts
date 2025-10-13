import 'dotenv/config';
import { connectDB } from "../src/lib/db";
import User from '@/models/user';
import { hashPassword } from "../src/lib/auth";

async function main() {
  await connectDB();

  const password = await hashPassword("admin123");
  const user = await User.create({
    username: "admin",
    password,
    role: "admin",
  });

  console.log("Usuario administrador creado:", user);
  process.exit();
}

main();
