"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function RepairForm({ repair, setRepair }: any) {
  const [status, setStatus] = useState(repair.status);
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/repairs/${repair._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updated = await res.json();
      setRepair(updated);
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4">
        <Select defaultValue={status} onValueChange={(value) => setStatus(value)}>
          <SelectTrigger className="w-[150px]"> 
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
              <SelectItem value="received">Recibido</SelectItem>
              <SelectItem value="in_progress">En reparación</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
          </SelectContent>
        </Select>
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
