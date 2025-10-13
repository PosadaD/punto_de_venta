"use client";

import { useEffect, useState } from "react";

interface User {
  _id: string;
  username: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("sales");
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    });

    setLoading(false);
    if (res.ok) {
      setUsername("");
      setPassword("");
      fetchUsers();
    } else {
      const err = await res.json();
      alert(err.error || "Error al crear usuario");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <main className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">Gestión de Usuarios</h1>

      {/* Formulario de creación */}
      <form
        onSubmit={createUser}
        className="bg-white shadow-md rounded p-6 mb-8 w-full max-w-md"
      >
        <h2 className="text-xl font-semibold mb-4">Agregar nuevo usuario</h2>

        <div className="mb-4">
          <label className="block text-gray-600">Nombre de usuario</label>
          <input
            className="border rounded w-full px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600">Contraseña</label>
          <input
            type="password"
            className="border rounded w-full px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600">Rol</label>
          <select
            className="border rounded w-full px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="admin">Administrador</option>
            <option value="sales">Ventas</option>
            <option value="inventory">Inventario</option>
            <option value="finance">Gastos / Compras</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Creando..." : "Crear usuario"}
        </button>
      </form>

      {/* Lista de usuarios */}
      <section className="bg-white shadow-md rounded p-6 w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-4">Usuarios existentes</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-100 text-left">
              <th className="p-2">Usuario</th>
              <th className="p-2">Rol</th>
              <th className="p-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b hover:bg-gray-50">
                <td className="p-2">{u.username}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2 text-right">
                  <button
                    onClick={() => deleteUser(u._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
