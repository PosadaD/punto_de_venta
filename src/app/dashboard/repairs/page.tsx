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
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react"; 
import { printFolioQR } from "../components/printFolio_QR";

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

  function handlePrint(repair: any) {
    printFolioQR({
      saleCode: repair.saleCode,
      serviceId: repair._id,
    });
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
                <TableHead>Contraseña</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Imprimir</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairs.map((r) => (
                <TableRow key={r._id}>
                  <TableCell>{r.saleCode}</TableCell>
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
                  <TableCell>{r.password || "-"}</TableCell>
                  <TableCell className="max-w-[200px] truncate overflow-scroll">
                    {r.description || "-"}
                  </TableCell>

                  {/* 🖨️ Botón de impresión */}
                  <TableCell>
                    <Button size="sm" onClick={() => handlePrint(r)}>
                      <Printer size={16} />
                    </Button>
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
