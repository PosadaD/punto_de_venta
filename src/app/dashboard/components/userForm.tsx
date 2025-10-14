"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UserFormProps {
  user: any | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function UserForm({ user, onClose, onSaved }: UserFormProps) {
  const [username, setUsername] = useState(user?.username || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user?.role || "sales");
  const isEditing = Boolean(user);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `/api/users/${user._id}` : "/api/users";

    const body = JSON.stringify({ username, password: password || undefined, role });

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    });

    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <Card className="w-[400px]">
        <CardContent>
          <h2 className="text-lg font-bold mt-2 mb-4">{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm">Usuario</label>
              <input
                type="text"
                className="border rounded w-full p-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm">Contraseña {isEditing && "(dejar vacío para no cambiar)"}</label>
              <input
                type="password"
                className="border rounded w-full p-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm">Rol</label>
              <select
                className="border rounded w-full p-2"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="admin">Administrador</option>
                <option value="sales">Ventas</option>
                <option value="inventory">Inventario</option>
                <option value="finance">Gastos/Compras</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit">{isEditing ? "Guardar cambios" : "Crear"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
