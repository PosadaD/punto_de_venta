"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import UserForm from "../components/userForm";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Obtener lista de usuarios
  async function fetchUsers() {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    fetchUsers();
  }

  async function handleEdit(user: any) {
    setEditingUser(user);
    setIsFormOpen(true);
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Gestión de Usuarios</h1>
        <Button onClick={() => { setEditingUser(null); setIsFormOpen(true); }}>
          Nuevo usuario
        </Button>
      </div>

      <Card>
        <CardContent>
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Usuario</th>
                <th className="p-2">Rol</th>
                <th className="p-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b">
                  <td className="p-2">{user.username}</td>
                  <td className="p-2">{user.role}</td>
                  <td className="p-2 text-right space-x-2">
                    <Button variant="outline" onClick={() => handleEdit(user)}>Editar</Button>
                    <Button variant="destructive" onClick={() => handleDelete(user._id)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {isFormOpen && (
        <UserForm
          user={editingUser}
          onClose={() => setIsFormOpen(false)}
          onSaved={fetchUsers}
        />
      )}
    </div>
  );
}
