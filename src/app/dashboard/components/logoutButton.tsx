"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login"); // Redirige al login
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 w-full text-white px-4 py-2 rounded hover:bg-red-700 transition"
    >
      Cerrar sesión
    </button>
  );
}
