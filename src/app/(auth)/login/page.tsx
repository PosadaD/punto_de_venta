"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "./loginForm";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Verifica si ya hay una sesión activa
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/verify");
        if (res.ok) {
          router.push("/dashboard"); // si ya está logueado, redirige al dashboard
        }
      } catch (error) {
        console.error("Error verificando sesión", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/dashboard"); // ✅ redirige tras iniciar sesión
    } else {
      alert("Credenciales incorrectas");
    }
  };

  if (loading) return <p className="text-center mt-10">Verificando sesión...</p>;

  return (
    <main className="flex justify-center items-center h-screen">
      <div className="shadow-lg p-8 rounded-2xl w-96">
        <h1 className="text-2xl font-semibold mb-4 text-center">Iniciar Sesión</h1>
        <LoginForm />
      </div>
    </main>
  );
}
