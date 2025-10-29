"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface Repair {
  _id: string;
  status: string;
  revision: string;
}

interface RepairFormProps {
  repair: Repair;
  setRepair: (repair: Repair) => void;
  userRoles: string[]; // Ahora es un array de roles
}

export default function RepairForm({ repair, setRepair, userRoles }: RepairFormProps) {
  const [status, setStatus] = useState(repair.status);
  const [revision, setRevision] = useState(repair.revision || "");
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/repairs/${repair._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, revision }),
      });
      const updated = await res.json();
      setRepair(updated);
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setSaving(false);
    }
  };

  const getSelectItems = () => {
    const isDelivery = userRoles.includes("delivery");
    const isTechnician = userRoles.includes("technician");

    if (isDelivery) {
      return (
        <>
          <SelectItem value="received">Recibido</SelectItem>
          <SelectItem value="in_progress">En reparación</SelectItem>
          <SelectItem value="completed">Completado</SelectItem>
          <SelectItem value="delivered">Entregado</SelectItem>
        </>
      );
    } else if (isTechnician) {
      return (
        <>
          <SelectItem value="received">Recibido</SelectItem>
          <SelectItem value="in_progress">En reparación</SelectItem>
          <SelectItem value="completed">Completado</SelectItem>
        </>
      );
    } else {
      // Si el rol no es delivery ni technician, puedes ajustar lo que quieras o mostrar todas las opciones
      return (
        <>
          <SelectItem value="received">Recibido</SelectItem>
          <SelectItem value="in_progress">En reparación</SelectItem>
          <SelectItem value="completed">Completado</SelectItem>
          <SelectItem value="delivered">Entregado</SelectItem>
        </>
      );
    }
  };

  return (
    <div className="mt-4">
      <Select value={status} onValueChange={(value) => setStatus(value)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          {getSelectItems()}
        </SelectContent>
      </Select>

      {userRoles.includes("technician") && (
        <textarea
          className="mt-3 w-full p-2 border border-gray-300 rounded"
          placeholder="Comentario de revisión"
          value={revision}
          onChange={(e) => setRevision(e.target.value)}
        />
      )}

      <button
        onClick={handleUpdate}
        disabled={saving}
        className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {saving ? "Guardando..." : "Actualizar estado"}
      </button>
    </div>
  );
}
