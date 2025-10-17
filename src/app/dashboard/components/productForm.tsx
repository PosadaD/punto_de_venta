"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ProductForm({ product, onClose, onSaved }: any) {
  const isEditing = Boolean(product);

  const [form, setForm] = useState({
    title: product?.title || "",
    code: product?.code || "",
    type: product?.type || "product", // 🔹 Nuevo campo
    purchaseDate: product?.purchaseDate?.slice(0, 10) || "",
    purchasePrice: product?.purchasePrice || 0,
    salePrice: product?.salePrice || 0,
    stock: product?.stock || 0,
  });


  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `/api/products/${product._id}` : "/api/products";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert(isEditing ? "✅ Producto actualizado" : "✅ Producto creado");
      onSaved();
      onClose();
    } else {
      alert("❌ Error al guardar producto");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <Card className="w-[400px]">
        <CardContent>
          <h2 className="text-lg font-bold mt-2 mb-4">
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm">Título</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} required className="border rounded w-full p-2" />
            </div>

            <div>
              <label className="block text-sm">Código</label>
              <input type="text" name="code" value={form.code} onChange={handleChange} className="border rounded w-full p-2" />
            </div>

            <div>
              <label className="block text-sm">Tipo</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="border rounded w-full p-2"
              >
                <option value="product">Producto</option>
                <option value="service">Servicio</option>
              </select>
            </div>

            {form.type === "product" &&(
              <>
                <div>
                  <label className="block text-sm">Fecha de compra</label>
                  <input type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} required className="border rounded w-full p-2" />
                </div>

                <div>
                  <label className="block text-sm">Stock disponible</label>
                  <input type="number" name="stock" value={form.stock} onChange={handleChange} required className="border rounded w-full p-2" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm">Precio compra</label>
                    <input type="number" name="purchasePrice" value={form.purchasePrice} onChange={handleChange} required className="border rounded w-full p-2" />
                  </div>

                  <div>
                    <label className="block text-sm">Precio venta</label>
                    <input type="number" name="salePrice" value={form.salePrice} onChange={handleChange} required className="border rounded w-full p-2" />
                  </div>
                </div>
              </>
            )}

            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit">{isEditing ? "Guardar" : "Crear"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
