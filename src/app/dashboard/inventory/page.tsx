"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductForm from "../components/productForm";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Obtener productos
  async function fetchProducts(query = "") {
    const res = await fetch(`/api/products?q=${query}`);
    const data = await res.json();
    setProducts(data);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts(search);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Inventario</h1>
        <Button onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}>
          Nuevo producto
        </Button>
      </div>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar por título o código..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          fetchProducts(e.target.value);
        }}
        className="border rounded p-2 w-full mb-4"
      />

      {/* Tabla */}
      <Card>
        <CardContent>
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Código</th>
                <th className="p-2">Título</th>
                <th className="p-2">Precio compra</th>
                <th className="p-2">Precio venta</th>
                <th className="p-2">Stock</th>
                <th className="p-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b">
                  <td className="p-2">{p.code}</td>
                  <td className="p-2">{p.title}</td>
                  <td className="p-2">${p.purchasePrice}</td>
                  <td className="p-2">${p.salePrice}</td>
                  <td className="p-2">{p.stock}</td>
                  <td className="p-2 text-right space-x-2">
                    <Button variant="outline" onClick={() => { setEditingProduct(p); setIsFormOpen(true); }}>
                      Editar
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(p._id)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          onClose={() => setIsFormOpen(false)}
          onSaved={() => fetchProducts(search)}
        />
      )}
    </div>
  );
}
