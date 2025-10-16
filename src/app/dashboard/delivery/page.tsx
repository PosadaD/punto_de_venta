"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type RepairItem = {
  _id: string;
  title: string;
  code?: string;
  customer: { name: string; phone: string };
  brand?: string;
  model?: string;
  description?: string;
  status: string;
  updatedAt: string;
};

export default function DeliveriesPage() {
  const [repairs, setRepairs] = useState<RepairItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDeliveries = async () => {
    try {
      const res = await fetch("/api/deliveries");
      if (!res.ok) throw new Error("Error cargando entregas");
      const data = await res.json();
      setRepairs(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const markDelivered = async (id: string) => {
    if (!confirm("¿Marcar como entregado?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/deliveries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar estado");
      // actualizar lista
      setRepairs((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Entregas pendientes</h1>
      {repairs.length === 0 ? (
        <div>No hay servicios completados para entregar</div>
      ) : (
        repairs.map((r) => (
          <Card key={r._id} className="mb-4">
            <CardContent>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold">{r.title} {r.code && `• ${r.code}`}</div>
                  <div>Cliente: {r.customer.name} • Tel: {r.customer.phone}</div>
                  {r.brand && <div>Marca: {r.brand} • Modelo: {r.model}</div>}
                  {r.description && <div>Nota: {r.description}</div>}
                  <div className="text-sm text-muted-foreground">Estado: {r.status}</div>
                </div>
                <div>
                  <Button
                    disabled={loading}
                    onClick={() => markDelivered(r._id)}
                  >
                    Marcar como entregado
                  </Button>
                </div>
              </div>
              <Separator className="my-2" />
              <div className="text-xs text-muted-foreground">
                Actualizado: {new Date(r.updatedAt).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
