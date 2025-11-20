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
  const [updating, setUpdating] = useState(false); // State for updating status

  // Estados en inglés para el backend
  const statesInEnglish = ["received", "in_progress", "completed"];
  // Estados en español para el frontend
  const statesInSpanish = ["Recibido", "En progreso", "Completado"];

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

  // Función para manejar el cambio de estado
  async function handleStatusChange(repairId: string, newStatus: string) {
    setUpdating(true); // Show loading while updating
    try {
      // Convertimos el estado seleccionado (en español) a su valor en inglés
      const statusInEnglish = statesInEnglish[statesInSpanish.indexOf(newStatus)];

      const res = await fetch(`/api/repairs/${repairId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: statusInEnglish }),
      });

      if (!res.ok) {
        throw new Error("Error al actualizar el estado");
      }

      const updatedRepair = await res.json();
      setRepairs((prevRepairs) =>
        prevRepairs.map((repair) =>
          repair._id === repairId ? { ...repair, status: statusInEnglish } : repair
        )
      );
      alert("Estado actualizado exitosamente");
    } catch (error) {
      alert("Error al actualizar el estado: " + console.log(error));
    } finally {
      setUpdating(false); // Hide loading
    }
  }

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
                <TableHead>Estado</TableHead> {/* New column for state */}
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

                  {/* Estado de la reparación - Lista desplegable */}
                  <TableCell>
                    <select
                      value={statesInSpanish[statesInEnglish.indexOf(r.status)]} // Mostrar estado en español
                      onChange={(e) =>
                        handleStatusChange(r._id, e.target.value)
                      }
                      disabled={updating} // Deshabilitar el select mientras se actualiza
                    >
                      {statesInSpanish.map((state, index) => (
                        <option key={index} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
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
