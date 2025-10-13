"use client";

import { useState } from "react";

export default function UserForm() {
  const [form, setForm] = useState({ username: "", password: "", role: "ventas" });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Usuario creado correctamente");
      setForm({ username: "", password: "", role: "ventas" });
    } else {
      setMessage(`❌ Error: ${data.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow w-full max-w-md">
      <h2 className="text-xl font-semibold text-gray-700">Registrar nuevo usuario</h2>

      <input
        name="username"
        value={form.username}
        onChange={handleChange}
        placeholder="Nombre de usuario"
        className="border p-2 rounded"
        required
      />

      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Contraseña"
        className="border p-2 rounded"
        required
      />

      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        className="border p-2 rounded"
      >
        <option value="ventas">Ventas</option>
        <option value="inventario">Inventario</option>
        <option value="compras">Compras</option>
        <option value="admin">Administrador</option>
      </select>

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Crear usuario
      </button>

      {message && <p className="text-sm text-gray-600">{message}</p>}
    </form>
  );
}
