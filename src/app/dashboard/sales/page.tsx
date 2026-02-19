"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { printTicket } from "../components/printTicket";

const IVA = Number(process.env.NEXT_PUBLIC_IVA_RATE ?? 0.16);

type ProductItem = {
  _id: string;
  title: string;
  code?: string;
  type: "product" | "service";
  stock?: number;
  salePrice: number;
};

type CartItem = {
  productId: string;
  title: string;
  code?: string;
  type: "product" | "service";
  qty: number;
  unitPrice: number;
  lineTotal: number;
  stock?: number;

  customerName?: string;
  customerPhone?: string;
  brand?: string;
  model?: string;
  password?: string;
  description?: string;

  technicianId?: string;
  deposit?: number;
};

export default function SalesPage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [user, setUser] = useState<{ userId: string; username: string; roles: string[] } | null>(null);
  const [loading, setLoading] = useState(false);


    // verify user & roles (sales or admin allowed)
  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/auth/verify");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        const u = data.user;
        if (!u || !u.role && !u.roles) {
          // accommodate both single role and roles array
          router.push("/login");
          return;
        }
        // normalize roles to array
        const roles = Array.isArray(u.roles) ? u.roles : [u.role];
        if (!roles.includes("sales") && !roles.includes("admin")) {
          // no permisos
          router.push("/login");
          return;
        }
        setUser({ userId: u.id ?? u.id, username: u.username ?? u.name ?? "unknown", roles });
      } catch (err) {
        router.push("/login");
      }
    }
    check();
  }, [router]);

  // 🔹 Cargar técnicos
  useEffect(() => {
    async function fetchTechnicians() {
      const res = await fetch("/api/users?role=technician");
      if (res.ok) {
        const data = await res.json();
        setTechnicians(data);
      }
    }
    fetchTechnicians();
  }, []);

  // 🔹 Buscar productos
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!query) {
        setSuggestions([]);
        return;
      }
      const res = await fetch(`/api/products?q=${query}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleAdd = (p: ProductItem) => {
    setCart((prev) => [
      ...prev,
      {
        productId: p._id,
        title: p.title,
        code: p.code,
        type: p.type,
        qty: 1,
        unitPrice: p.salePrice,
        lineTotal: p.salePrice,
        stock: p.stock,
        deposit: 0,
      },
    ]);
    setQuery("");
    setSuggestions([]);
  };

  const updateField = (index: number, field: keyof CartItem, value: any) => {
  setCart((prev) => {
    const copy = [...prev];

    // Validación de stock si es producto y se modifica la cantidad
    if (field === "qty" && copy[index].type === "product") {
      const maxStock = copy[index].stock ?? Infinity;
      if (value > maxStock) {
        alert(`No hay suficiente stock. Disponible: ${maxStock}`);
        value = maxStock;
      }
      if (value < 1) value = 1;
    }

    // Actualiza el campo
    // @ts-ignore
    copy[index][field] = value;

    // recalcula el total de la línea si cambia cantidad o precio
    if (field === "unitPrice" || field === "qty") {
      copy[index].lineTotal = copy[index].unitPrice * copy[index].qty;
    }

    return copy;
  });
};


  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const totals = cart.reduce(
    (acc, it) => {
      acc.total += it.lineTotal;
      return acc;
    },
    { total: 0 }
  );

  const total = totals.total ;
  const totalNet = total / (1 + IVA);
  const totalTax = total - totalNet;

  const finalizeSale = async () => {
    if (!cart.length) return alert("Carrito vacío");

    for (const c of cart) {
      if (c.type === "service") {
        if (!c.customerName || !c.customerPhone)
          return alert("Completa datos del cliente");

        if (!c.technicianId)
          return alert("Selecciona técnico");

        if ((c.deposit ?? 0) > c.lineTotal)
          return alert("Anticipo inválido");
      }
    }

    setLoading(true);

    // helper: generate saleCode (client-side); backend can override if needed
    const generateSaleCode = () => {
      const d = new Date();
      const datePart =
        d.getFullYear().toString() +
        String(d.getMonth() + 1).padStart(2, "0") +
        String(d.getDate()).padStart(2, "0");
      const timePart =
        String(d.getHours()).padStart(2, "0") +
        String(d.getMinutes()).padStart(2, "0") +
        String(d.getSeconds()).padStart(2, "0");
      const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
      return `${datePart}-${timePart}-${rnd}`;
    };


    // prepare payload: map items, include service extra fields inside item
    const items = cart.map((c) => ({
      productId: c.productId,
      qty: c.qty,
      unitPrice: c.unitPrice,
      serviceInfo:
        c.type === "service"
          ? {
              customerName: c.customerName,
              customerPhone: c.customerPhone,
              brand: c.brand,
              model: c.model,
              password: c.password,
              description: c.description,
              technicianId: c.technicianId,
              deposit: c.deposit ?? 0,
            }
          : undefined,
    }));


    //obtener el anticipo
    const anticipo = cart.reduce((acc, item) => {
      return acc + (item.deposit ?? 0);
    }, 0);


    // generate saleCode clientside
    const saleCode = generateSaleCode();

    // include user info if available
    const payload: any = {
      items,
      saleCode,
      user: user ? { userId: user.userId, username: user.username } : null,
    };

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return alert(data.error);

    printTicket({ sale: data.sale ?? data.saleId ?? data, cart, total, anticipo, totalNet, totalTax, saleCode, user });


    setCart([]);
  };

  const formatMoney = (n: number) => n.toFixed(2);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Ventas</h1>

      <Card>
        <CardContent className="space-y-4">

          <div>
            <Label>Buscar producto/servicio</Label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {suggestions.length > 0 && (
            <div className="border p-2">
              {suggestions.map((s) => (
                <div
                  key={s._id}
                  className="flex justify-between items-center p-2 hover:bg-gray-50"
                >
                  <div>
                    {s.title}
                    <Badge className="ml-2">
                      {s.type}
                    </Badge>
                  </div>
                  <Button size="sm" onClick={() => handleAdd(s)}>
                    <Plus size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Separator />

          {cart.map((c, i) => (
            <div key={i} className="border p-3 rounded space-y-2">
              <div className="flex justify-between">
                <div>
                  {c.title}
                  <Badge className="ml-2">{c.type}</Badge>
                </div>
                <div className="flex items-center">
                  {c.type === "product" && (
                    <p className="font-bold">${c.unitPrice}</p>)}
                  <Button variant="ghost" onClick={() => removeItem(i)}>
                    <Trash />
                  </Button>
                </div>
              </div>

              {/* Campos extra solo para servicios */}
              {c.type === "service" && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input
                    placeholder="Nombre"
                    onChange={(e) =>
                      updateField(i, "customerName", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Teléfono"
                    onChange={(e) =>
                      updateField(i, "customerPhone", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Marca"
                    onChange={(e) => updateField(i, "brand", e.target.value)}
                  />
                  <Input
                    placeholder="Modelo"
                    onChange={(e) => updateField(i, "model", e.target.value)}
                  />
                  <Input
                    placeholder="Contraseña"
                    onChange={(e) =>
                      updateField(i, "password", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Descripción"
                    onChange={(e) =>
                      updateField(i, "description", e.target.value)
                    }
                  />

                  <select
                    className="border rounded p-2"
                    value={c.technicianId ?? ""}
                    onChange={(e) =>
                      updateField(i, "technicianId", e.target.value)
                    }
                  >
                    <option value="">Seleccionar técnico</option>
                    {technicians
                      .filter((t) => t.roles.includes("technician"))
                      .map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.username}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="flex gap-2 items-center">
                {/* Cantidad para productos y servicios */}
                <label>Cantidad</label>
                <Input
                  type="number"
                  value={c.qty}
                  min={1}
                  max={c.type === "product" ? c.stock : undefined}
                  onChange={(e) =>
                    updateField(i, "qty", Number(e.target.value))
                  }
                />

                {/* Precio solo editable para servicios */}
                {c.type === "service" && (
                  <>
                    <label>Precio</label>
                    <Input
                      type="number"
                      value={c.unitPrice}
                      onChange={(e) =>
                        updateField(i, "unitPrice", Number(e.target.value))
                      }
                    />

                    <label>Anticipo</label>
                    <Input
                      type="number"
                      placeholder="Anticipo"
                      value={c.deposit ?? 0}
                      onChange={(e) =>
                        updateField(i, "deposit", Number(e.target.value))
                      }
                    />
                  </>
                )}
              </div>
            </div>
          ))}


          <Separator />

          <div>
            <div>Subtotal: ${formatMoney(totalNet)}</div>
            <div>IVA: ${formatMoney(totalTax)}</div>
            <div className="text-xl font-bold">
              Total: ${formatMoney(total)}
            </div>
          </div>

          <Button
            onClick={finalizeSale}
            disabled={loading}
          >
            {loading ? "Procesando..." : "Finalizar Venta"}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
