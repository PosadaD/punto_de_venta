"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash, Edit, Save, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type SaleItem = {
  _id?: string;
  productId: string;
  title: string;
  code?: string;
  type: "product" | "service";
  qty: number;
  unitPrice: number;
  lineTotal: number;
  serviceInfo?: {
    customerName?: string;
    customerPhone?: string;
    brand?: string;
    model?: string;
    description?: string;
  };
};

type Sale = {
  _id: string;
  saleCode: string;
  items: SaleItem[];
  total: number;
  totalNet: number;
  totalTax: number;
  createdAt: string;
  user: { username: string };
};

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedItems, setEditedItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch sales
  const fetchSales = async () => {
    try {
      const res = await fetch("/api/sales");
      const data = await res.json();
      setSales(data);
      setFilteredSales(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Filtrar por folio
  useEffect(() => {
    const filtered = sales.filter((sale) =>
      sale.saleCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSales(filtered);
  }, [searchQuery, sales]);

  // Edit sale
  const startEditing = (sale: Sale) => {
    setEditingId(sale._id);
    setEditedItems(sale.items.map((i) => ({ ...i })));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedItems([]);
  };

  const updateItemPrice = (index: number, value: number) => {
    setEditedItems((prev) => {
      const copy = [...prev];
      copy[index].unitPrice = value;
      copy[index].lineTotal = value * copy[index].qty;
      return copy;
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/sales/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: editedItems }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error actualizando venta");
        setLoading(false);
        return;
      }
      alert("Venta actualizada correctamente");
      cancelEditing();
      fetchSales();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const deleteSale = async (id: string) => {
    if (!confirm("¿Deseas eliminar esta venta?")) return;
    try {
      const res = await fetch(`/api/sales/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error eliminando venta");
        return;
      }
      alert("Venta eliminada");
      fetchSales();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Historial de Ventas</h1>

      {/* Buscador */}
      <div className="mb-4">
        <Input
          placeholder="Buscar por folio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredSales.length === 0 && <div>No se encontraron ventas</div>}

      {filteredSales.map((sale) => {
        const isEditing = editingId === sale._id;
        const items = isEditing ? editedItems : sale.items;

        return (
          <Card key={sale._id} className="mb-4">
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <strong>Folio:</strong> {sale.saleCode} <br />
                  <strong>Fecha:</strong> {new Date(sale.createdAt).toLocaleString()} <br />
                  <strong>Vendedor:</strong> {sale.user?.username ?? "-"}
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button size="sm" onClick={saveEdit} disabled={loading}><Save size={16} /></Button>
                      <Button size="sm" variant="outline" onClick={cancelEditing}><X size={16} /></Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" onClick={() => startEditing(sale)}><Edit size={16} /></Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteSale(sale._id)}><Trash size={16} /></Button>
                    </>
                  )}
                </div>
              </div>
              <Separator className="my-2" />
              <div className="space-y-1">
                {items.map((item, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b py-1">
                    <div className="flex-1">
                      <div className="font-medium">{item.title} {item.code ? `(${item.code})` : ""}</div>
                      {item.type === "service" && item.serviceInfo && (
                        <div className="text-xs text-muted-foreground">
                          Cliente: {item.serviceInfo.customerName}, Tel: {item.serviceInfo.customerPhone} <br />
                          Marca/Modelo: {item.serviceInfo.brand}/{item.serviceInfo.model} <br />
                          Descripción: {item.serviceInfo.description}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div>Cantidad: {item.qty}</div>
                      {isEditing ? (
                        <Input type="number" value={item.unitPrice} step={0.01} onChange={(e) => updateItemPrice(i, Number(e.target.value))} className="w-24" />
                      ) : (
                        <div>Precio: ${item.unitPrice.toFixed(2)}</div>
                      )}
                      <div>Total: ${item.lineTotal.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-2" />
              <div className="flex justify-end gap-4 font-bold">
                <div>Subtotal: ${sale.totalNet.toFixed(2)}</div>
                <div>IVA: ${sale.totalTax.toFixed(2)}</div>
                <div>Total: ${sale.total.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
