"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    type: "fixed",
    title: "",
    amount: "",
    date: "",
    description: "",
    category: "",
  });

  async function fetchExpenses() {
    setLoading(true);
    const res = await fetch("/api/expenses");
    const data = await res.json();
    setExpenses(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.amount || !form.date) return alert("Faltan campos obligatorios");
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount),
      }),
    });
    setForm({
      type: "fixed",
      title: "",
      amount: "",
      date: "",
      description: "",
      category: "",
    });
    fetchExpenses();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este gasto?")) return;
    await fetch("/api/expenses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchExpenses();
  }

  const fixedTotal = expenses
    .filter((e) => e.type === "fixed")
    .reduce((sum, e) => sum + e.amount, 0);
  const variableTotal = expenses
    .filter((e) => e.type === "variable")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Registrar Gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fijo</SelectItem>
                  <SelectItem value="variable">Variable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ej. Renta, Luz, Mantenimiento..."
              />
            </div>

            <div>
              <label className="text-sm font-medium">Monto</label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Fecha</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Categoría</label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Ej. Servicios, Oficina, Transporte..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detalles adicionales..."
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tabla de gastos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500">Cargando...</p>
          ) : expenses.length === 0 ? (
            <p className="text-center text-gray-500">No hay gastos registrados</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e._id}>
                    <TableCell>
                      {e.type === "fixed" ? "Fijo" : "Variable"}
                    </TableCell>
                    <TableCell>{e.title}</TableCell>
                    <TableCell>
                      {new Date(e.date).toLocaleDateString("es-MX")}
                    </TableCell>
                    <TableCell>${e.amount.toFixed(2)}</TableCell>
                    <TableCell>{e.category}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {e.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(e._id)}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Totales */}
          <div className="mt-4 flex justify-end text-sm font-semibold text-gray-700">
            <div className="space-x-6">
              <span>Fijos: ${fixedTotal.toFixed(2)}</span>
              <span>Variables: ${variableTotal.toFixed(2)}</span>
              <span>Total: ${(fixedTotal + variableTotal).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
