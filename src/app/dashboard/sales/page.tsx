"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash, Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { printTicket } from "../components/printTicket";


const IVA = Number(process.env.IVA_RATE ?? 0.16);


/**
 * SalesPage:
 * - búsqueda en tiempo real por título o código (misma barra)
 * - sugiere productos/servicios (filtra products con stock <=0)
 * - al añadir producto: aparece en carrito con contador que respeta stock
 * - al añadir servicio: despliega junto al artículo campos: cliente, marca, modelo, descripción (inline)
 * - calcula totals, neto e IVA (precio incluye IVA)
 * - genera saleCode y manda user info (desde /api/auth/verify) al backend
 * - imprime ticket listo para rollo
 */

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
  // campos para servicio (opcionales)
  customerName?: string;
  customerPhone?: string;
  brand?: string;
  model?: string;
  password?: string;
  description?: string;
};

export default function SalesPage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<{ userId: string; username: string; roles: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState<number | null>(null);

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

  // realtime search (debounced)
  useEffect(() => {
    if (searchDebounce) window.clearTimeout(searchDebounce);
    const id = window.setTimeout(async () => {
      if (!query || query.trim().length === 0) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
        if (!res.ok) {
          setSuggestions([]);
          return;
        }
        const arr = await res.json();
        // filter: exclude product with stock <= 0
        const filtered = arr.filter((p: any) => !(p.type === "product" && (p.stock ?? 0) <= 0));
        setSuggestions(filtered);
      } catch (err) {
        setSuggestions([]);
      }
    }, 180);
    setSearchDebounce(id);
    return () => window.clearTimeout(id);
  }, [query]);

  // add product/service from suggestions
  const handleAddSuggestion = (p: ProductItem) => {
    // If product: require stock check
    setCart((prev) => {
      const idx = prev.findIndex((it) => it.productId === p._id);
      if (idx >= 0) {
        // increase qty by 1, respecting stock for products
        const next = [...prev];
        const newQty = next[idx].qty + 1;
        if (p.type === "product" && p.stock !== undefined && newQty > p.stock) {
          alert("No hay suficiente stock");
          return prev;
        }
        next[idx].qty = newQty;
        next[idx].lineTotal = next[idx].qty * next[idx].unitPrice;
        return next;
      }
      const item: CartItem = {
        productId: p._id,
        title: p.title,
        code: p.code,
        type: p.type,
        qty: 1,
        unitPrice: p.salePrice,
        lineTotal: p.salePrice,
        stock: p.stock,
      };
      // if it's a service, we want to open the inline form on the cart so user fills client data
      return [...prev, item];
    });
    setQuery("");
    setSuggestions([]);
  };

  // update qty (respect stock if product)
  const updateQty = (index: number, qty: number) => {
    if (qty <= 0) return;
    setCart((prev) => {
      const copy = [...prev];
      if (copy[index].type === "product" && copy[index].stock !== undefined && qty > copy[index].stock) {
        alert("No hay suficiente stock disponible");
        return copy;
      }
      copy[index].qty = qty;
      copy[index].lineTotal = Number((qty * copy[index].unitPrice).toFixed(2));
      return copy;
    });
  };

  // remove item
  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // update service fields inline
  const updateServiceField = (index: number, field: keyof CartItem, value: any) => {
    setCart((prev) => {
      const copy = [...prev];
      // @ts-ignore
      copy[index][field] = value;

       // si se modifica el precio o la cantidad, recalcular lineTotal
      if (field === "unitPrice" || field === "qty") {
        copy[index].lineTotal = Number((copy[index].unitPrice * copy[index].qty).toFixed(2));
      }

      return copy;
    });
  };

  // totals
  const totals = cart.reduce(
    (acc, it) => {
      acc.total += it.lineTotal;
      return acc;
    },
    { total: 0 }
  );
  const total = totals.total;
  const totalNet = total / (1 + IVA);
  const totalTax = total - totalNet;

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

  // finalize sale
  const finalizeSale = async () => {
    if (!cart.length) {
      alert("El carrito está vacío");
      return;
    }
    // If there are services, ensure each service line has customer and brand/model/description
    const serviceLines = cart.filter((c) => c.type === "service");
    if (serviceLines.length > 0) {
      for (const [i, s] of serviceLines.entries()) {
        if (!s.customerName || !s.customerPhone) {
          alert(`Completa nombre/telefono en servicio #${i + 1}`);
          return;
        }
        if (!s.brand || !s.model || !s.description) {
          alert(`Completa marca/modelo/descr. en servicio #${i + 1}`);
          return;
        }
      }
    }

    setLoading(true);

    // prepare payload: map items, include service extra fields inside item
    const items = cart.map((c) => {
      const base: any = {
        productId: c.productId,
        qty: c.qty,
        unitPrice: c.unitPrice,
      };
      if (c.type === "service") {
        base.serviceInfo = {
          customerName: c.customerName,
          customerPhone: c.customerPhone,
          brand: c.brand,
          model: c.model,
          password: c.password,
          description: c.description,
        };
      }
      return base;
    });

    // generate saleCode clientside
    const saleCode = generateSaleCode();

    // include user info if available
    const payload: any = {
      items,
      saleCode,
      user: user ? { userId: user.userId, username: user.username } : null,
    };

    // if there's any service, include a top-level customer? we'll include per-service data
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        alert(data.error || "Error creando la venta");
        return;
      }


      // success: print ticket (we'll include services details too)
      printTicket({ sale: data.sale ?? data.saleId ?? data, cart, total, totalNet, totalTax, saleCode, user });


      // reset cart
      setCart([]);
    } catch (err) {
      setLoading(false);
      alert("Error de red al crear la venta");
      console.error(err);
    }
  };

  // helpers
  function formatMoney(n: number) {
    return Number(n).toFixed(2);
  }
  function escapeHtml(s: string) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // render
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Ventas</h1>

      <Card className="mb-4">
        <CardContent>
          {/* Search */}
          <div className="mb-3">
            <Label>Buscar</Label>
            <div className="relative">
              <Input placeholder="Escribe título o código..." value={query} onChange={(e) => setQuery(e.target.value)} />
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 bg-white shadow z-30 mt-1 max-h-56 overflow-auto border">
                  {suggestions.map((s) => (
                    <div key={s._id} className="p-2 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <div className="font-medium">{s.title}</div>
                        <div className="text-xs text-muted-foreground">{s.code ?? ""} • {s.type} {s.type === "product" ? `• Stock: ${s.stock ?? 0}` : ""}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">${formatMoney(s.salePrice)}</div>
                        <Button size="sm" onClick={() => handleAddSuggestion(s)}>
                          <Plus size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Cart */}
          <div className="mt-3">
            <h3 className="font-semibold mb-2">Carrito</h3>
            {cart.length === 0 ? (
              <div className="text-sm text-muted-foreground">Carrito vacío</div>
            ) : (
              <div className="space-y-2">
                {cart.map((c, i) => (
                  <div key={c.productId} className="p-2 border rounded flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{c.title}</div>
                        <Badge variant="secondary">{c.type === "service" ? "Servicio" : "Producto"}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{c.code ?? ""}</div>

                      {/* If product: show available stock */}
                      {c.type === "product" && (
                        <div className="mt-1 text-sm text-muted-foreground">Disponible: {c.stock ?? 0}</div>
                      )}

                      {/* If service: show inline fields (name, phone, brand, model, description) */}
                      {c.type === "service" && (
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                          <Input placeholder="Nombre del cliente" value={c.customerName ?? ""} onChange={(e) => updateServiceField(i, "customerName", e.target.value)} />
                          <Input placeholder="Teléfono" value={c.customerPhone ?? ""} onChange={(e) => updateServiceField(i, "customerPhone", e.target.value)} />
                          <Input placeholder="Marca" value={c.brand ?? ""} onChange={(e) => updateServiceField(i, "brand", e.target.value)} />
                          <Input placeholder="Modelo" value={c.model ?? ""} onChange={(e) => updateServiceField(i, "model", e.target.value)} />
                          <Input placeholder="Contrasena" value={c.password ?? ""} onChange={(e) => updateServiceField(i, "password", e.target.value)} />
                          <Input placeholder="Descripción (breve)" value={c.description ?? ""} onChange={(e) => updateServiceField(i, "description", e.target.value)} />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div>
                        <Input type="number" min={1} value={c.qty} onChange={(e) => updateQty(i, Number(e.target.value))} className="w-20" />
                      </div>
                      {c.type === "service" ? (
                        <div className="mt-2 flex flex-col gap-2 items-center">
                          <span className="text-sm text-muted-foreground">Precio</span>
                          <Input
                            type="number"
                            required
                            value={c.unitPrice}
                            onChange={(e) => updateServiceField(i, "unitPrice", Number(e.target.value))}
                            placeholder="Precio del servicio"
                            className="w-32"
                          />
                        </div>
                      ): <div className="w-24 text-right">${formatMoney(c.lineTotal)}</div>}
                      <div className="flex gap-1">
                        <Button variant="ghost" onClick={() => removeItem(i)}><Trash /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Totals & actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div>Subtotal: ${formatMoney(totalNet)}</div>
              <div>IVA ({(IVA * 100).toFixed(0)}%): ${formatMoney(totalTax)}</div>
              <div className="text-xl font-bold">Total: ${formatMoney(total)}</div>
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <Button onClick={finalizeSale} disabled={loading}>{loading ? "Procesando..." : "Finalizar venta"}</Button>
              <Button variant="outline" onClick={() => { setCart([]); }}>Vaciar</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
