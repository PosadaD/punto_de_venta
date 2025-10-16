"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function RepairsPage() {
  const [repairs, setRepairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchRepairs() {
    setLoading(true);
    const res = await fetch("/api/repairs");
    const data = await res.json();
    setRepairs(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchRepairs();
  }, []);

  async function handleStatusChange(id: string, newStatus: string) {
    await fetch("/api/repairs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    fetchRepairs();
  }

  return (
    <Card className="m-6">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Reparaciones en proceso</CardTitle>
        <Button variant="outline" onClick={fetchRepairs}>
          Actualizar
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : repairs.length === 0 ? (
          <p className="text-center text-gray-500">
            No hay reparaciones pendientes
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Venta</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairs.map((r) => (
                <TableRow key={r._id}>
                  <TableCell>{r.saleId}</TableCell>
                  <TableCell>
                    {r.customer?.name || "-"}
                    <br />
                    <span className="text-sm text-gray-500">
                      {r.customer?.phone || ""}
                    </span>
                  </TableCell>
                  <TableCell>{r.title}</TableCell>
                  <TableCell>{r.brand || "-"}</TableCell>
                  <TableCell>{r.model || "-"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {r.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={r.status}
                      onValueChange={(val) => handleStatusChange(r._id, val)}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="received">Recibido</SelectItem>
                        <SelectItem value="in_progress">En reparación</SelectItem>
                        <SelectItem value="completed">Completado</SelectItem>
                        <SelectItem value="delivered">Entregado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(r.createdAt).toLocaleDateString("es-MX")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
