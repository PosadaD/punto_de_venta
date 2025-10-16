"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(false);

  async function fetchReport() {
    setLoading(true);
    const from = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
    const to = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "";
    const query = from && to ? `?from=${from}&to=${to}` : "";
    const res = await fetch(`/api/reports${query}`);
    const data = await res.json();
    setReport(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchReport();
  }, []);

  const chartData = report
    ? [
        { name: "Ventas", value: report.totalSales },
        { name: "Costo", value: report.totalCost },
        { name: "Gastos", value: report.totalExpenses },
        { name: "Utilidad Neta", value: report.netProfit },
      ]
    : [];

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reportes Financieros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            <Button onClick={fetchReport}>Filtrar</Button>
          </div>

          {loading && <p className="text-center text-gray-500">Cargando reporte...</p>}
          {!loading && report && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <Card>
                  <CardHeader>
                    <CardTitle>Ventas Totales</CardTitle>
                  </CardHeader>
                  <CardContent>${report.totalSales.toFixed(2)}</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>IVA Desglosado</CardTitle>
                  </CardHeader>
                  <CardContent>${report.totalIVA.toFixed(2)}</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Utilidad Bruta</CardTitle>
                  </CardHeader>
                  <CardContent>${report.grossProfit.toFixed(2)}</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Utilidad Neta</CardTitle>
                  </CardHeader>
                  <CardContent>${report.netProfit.toFixed(2)}</CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gastos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Fijos: ${report.totalFixed.toFixed(2)}</p>
                    <p>Variables: ${report.totalVariable.toFixed(2)}</p>
                    <p>Total: ${report.totalExpenses.toFixed(2)}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ventas de Servicios Entregados</CardTitle>
                  </CardHeader>
                  <CardContent>{report.serviceSales}</CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Gráfica General</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#2563eb" radius={6} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
