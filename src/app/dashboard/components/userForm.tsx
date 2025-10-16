"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UserFormProps {
  user: any | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function UserForm({ user, onClose, onSaved }: UserFormProps) {
  const isEditing = Boolean(user);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    roles: user?.roles || [],
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        password: "",
        roles: Array.isArray(user.roles) ? user.roles : [user.role || ""],
      });
    }
  }, [user]);

  const rolesList = ["admin", "sales", "inventory", "finance", "technician", "delivery"];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (role: string) => {
    setFormData((prev) => {
      if (prev.roles.includes(role)) {
        return { ...prev, roles: prev.roles.filter((r: string) => r !== role) };
      } else {
        return { ...prev, roles: [...prev.roles, role] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `/api/users/${user._id}` : "/api/users";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert(isEditing ? "✅ Usuario actualizado correctamente" : "✅ Usuario creado correctamente");
      onSaved();
      onClose();
    } else {
      alert("❌ Error al guardar usuario");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <Card className="w-[400px]">
        <CardContent>
          <h2 className="text-lg font-bold mt-2 mb-4">
            {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm">Usuario</label>
              <input
                type="text"
                className="border rounded w-full p-2"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm">
                Contraseña {isEditing && "(dejar vacío para no cambiar)"}
              </label>
              <input
                type="password"
                className="border rounded w-full p-2"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm">Roles</label>
              <div className="grid grid-cols-2 gap-2">
                {rolesList.map((role) => (
                  <label key={role} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.roles.includes(role)}
                      onChange={() => handleCheckboxChange(role)}
                    />
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? "Guardar cambios" : "Crear"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
