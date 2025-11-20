"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type Repair = {
  _id: string;
  saleCode: string;
  title: string;
  customer: { name: string; phone: string };
  brand?: string;
  model?: string;
  description?: string;
  status: string;
  updatedAt: string;
};

export default function RepairsHistoryPage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [filtered, setFiltered] = useState<Repair[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Repair>>({});
  
  // Opciones de estado
  const states = ["received", "in_progress", "completed", "delivered"];

  const fetchRepairs = async () => {
    try {
      const res = await fetch("/api/repairs/all");
      if (!res.ok) throw new Error("Error cargando historial");
      const data = await res.json();
      setRepairs(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const handleSearch = (e: any) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFiltered(
      repairs.filter(
        (r) =>
          r.saleCode?.toLowerCase().includes(value) ||
          r.customer?.name?.toLowerCase().includes(value) ||
          r.model?.toLowerCase().includes(value)
      )
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta reparación?")) return;
    try {
      const res = await fetch(`/api/repairs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      setRepairs((prev) => prev.filter((r) => r._id !== id));
      setFiltered((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handleEdit = (r: Repair) => {
    setEditingId(r._id);
    setEditForm(r);
  };

  const handleSave = async () => {
    if (!editingId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/repairs/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar");
      setEditingId(null);
      await fetchRepairs();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Historial de reparaciones</h1>

      <Input
        placeholder="Buscar por folio, cliente o modelo..."
        value={search}
        onChange={handleSearch}
        className="max-w-md"
      />

      {filtered.length === 0 ? (
        <div className="text-muted-foreground">No hay reparaciones registradas.</div>
      ) : (
        filtered.map((r) => (
          <Card key={r._id} className="mb-3">
            <CardContent className="p-4">
              {editingId === r._id ? (
                <div className="space-y-2">
                  <input
                    className="border p-2 rounded w-full"
                    value={editForm.customer?.name || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        customer: { ...editForm.customer!, name: e.target.value },
                      })
                    }
                    placeholder="Nombre del cliente"
                  />
                  <input
                    className="border p-2 rounded w-full"
                    value={editForm.model || ""}
                    onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                    placeholder="Modelo"
                  />
                  <input
                    className="border p-2 rounded w-full"
                    value={editForm.brand || ""}
                    onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                    placeholder="Marca"
                  />
                  <textarea
                    className="border p-2 rounded w-full"
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Descripción"
                  />
                  
                  {/* Agregar select para el estado */}
                  <div>
                    <label className="block">Estado</label>
                    <select
                      value={editForm.status || r.status}
                      onChange={(e) =>
                        setEditForm({ ...editForm, status: e.target.value })
                      }
                      className="border p-2 rounded w-full"
                    >
                      {states.map((state) => (
                        <option key={state} value={state}>
                          {state === "received" && "Recibido"}
                          {state === "in_progress" && "En progreso"}
                          {state === "completed" && "Completado"}
                          {state === "delivered" && "Entregado"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setEditingId(null)}>
                      Cancelar
                    </Button>
                    <Button disabled={loading} onClick={handleSave}>
                      Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="font-bold">{r.title}</div>
                  <div>Folio: {r.saleCode}</div>
                  <div>Cliente: {r.customer.name}</div>
                  <div>Modelo: {r.model}</div>
                  <div>Marca: {r.brand}</div>
                  <div>Estado: {r.status}</div>
                  {r.description && <div>Nota: {r.description}</div>}
                  <Separator className="my-2" />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => handleEdit(r)}>
                      Editar
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(r._id)}>
                      Eliminar
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
