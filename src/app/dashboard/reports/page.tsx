"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const [selectedMonth, setSelectedMonth] = useState<string>("");

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

  function handleMonthChange(monthStr: string) {
    setSelectedMonth(monthStr);

    if (!monthStr) return;

    const [year, month] = monthStr.split("-").map(Number);
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0);

    setDateRange({ from, to });
    fetchReport();
  }

  useEffect(() => {
    fetchReport();
  }, []);

  const chartData = report
    ? [
        { name: "Ingresos Productos", value: report.productIncome },
        { name: "Ingresos Servicios", value: report.serviceIncome },
        { name: "Gastos Totales", value: report.totalExpenses },
        { name: "Utilidad Neta", value: report.netProfit },
      ]
    : [];

  const year = new Date().getFullYear();
  const months = [
    "01-Enero",
    "02-Febrero",
    "03-Marzo",
    "04-Abril",
    "05-Mayo",
    "06-Junio",
    "07-Julio",
    "08-Agosto",
    "09-Septiembre",
    "10-Octubre",
    "11-Noviembre",
    "12-Diciembre",
  ];

  return (
    <div className="p-6 space-y-6">

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Reportes Financieros</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* FILTROS */}
          <div className="flex flex-wrap gap-4 items-center">

            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            <Button onClick={fetchReport}>Filtrar</Button>

            <select
              className="border rounded-md p-2"
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
            >
              <option value="">Filtrar por mes...</option>
              {months.map((m) => {
                const [num, label] = m.split("-");
                const value = `${year}-${num}`;
                return (
                  <option key={value} value={value}>
                    {label} {year}
                  </option>
                );
              })}
            </select>

          </div>

          {loading && <p className="text-center text-muted-foreground">Cargando reporte...</p>}

          {!loading && report && (
            <>
              {/* INGRESOS */}
              <Card>
                <CardHeader>
                  <CardTitle>Ingresos Totales</CardTitle>
                </CardHeader>

                <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

                  <Card className="p-4">
                    <CardTitle className="text-sm">Ingresos por Productos</CardTitle>
                    <p className="text-xl font-semibold">${report.productIncome.toFixed(2)}</p>
                  </Card>

                  <Card className="p-4">
                    <CardTitle className="text-sm">Ingresos por Servicios</CardTitle>
                    <p className="text-xl font-semibold">${report.serviceIncome.toFixed(2)}</p>
                  </Card>

                  <Card className="p-4">
                    <CardTitle className="text-sm">Costo de Productos</CardTitle>
                    <p className="text-xl font-semibold text-red-600">${report.productCost.toFixed(2)}</p>
                  </Card>

                  <Card className="p-4">
                    <CardTitle className="text-sm">Total Ingresos</CardTitle>
                    <p className="text-xl font-semibold">${report.totalIncome.toFixed(2)}</p>
                  </Card>

                </CardContent>
              </Card>

              {/* REPARACIONES */}
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas de Reparaciones</CardTitle>
                </CardHeader>

                <CardContent className="grid md:grid-cols-3 gap-4">

                  <Card className="p-4">
                    <CardTitle className="text-sm">Reparaciones Entregadas</CardTitle>
                    <p className="text-xl font-semibold">{report.repairCount}</p>
                  </Card>

                  <Card className="p-4">
                    <CardTitle className="text-sm">Promedio por Reparación</CardTitle>
                    <p className="text-xl font-semibold">${report.avgRepairIncome.toFixed(2)}</p>
                  </Card>

                  <Card className="p-4">
                    <CardTitle className="text-sm">Total por Servicios</CardTitle>
                    <p className="text-xl font-semibold">${report.serviceIncome.toFixed(2)}</p>
                  </Card>

                </CardContent>
              </Card>

              {/* NUEVOS KPIS */}
              <Card>
                <CardHeader>
                  <CardTitle>KPIs Avanzados</CardTitle>
                </CardHeader>

                <CardContent className="grid md:grid-cols-3 gap-4">

                  <Card className="p-4">
                    <CardTitle className="text-sm">Tickets Promedio por Día</CardTitle>
                    <p className="text-xl font-semibold">{report.dailyStats.avgTicketsPerDay}</p>
                  </Card>

                  <Card className="p-4">
                    <CardTitle className="text-sm">Ingreso Promedio por Día</CardTitle>
                    <p className="text-xl font-semibold">${report.dailyStats.avgIncomePerDay.toFixed(2)}</p>
                  </Card>

                  <Card className="p-4">
                    <CardTitle className="text-sm">Crecimiento Mensual</CardTitle>
                    <p className="text-xl font-semibold text-green-600">
                      {report.growth.monthPercent.toFixed(2)}%
                    </p>
                  </Card>

                  <Card className="p-4">
                    <CardTitle className="text-sm">Margen de Ganancia</CardTitle>
                    <p className="text-xl font-semibold">
                      {report.margin.toFixed(2)}%
                    </p>
                  </Card>

                  <Card className="p-4">
                    <CardTitle className="text-sm">Ticket Promedio Venta</CardTitle>
                    <p className="text-xl font-semibold">${report.avgTicketSale.toFixed(2)}</p>
                  </Card>

                  <Card className="p-4">
                    <CardTitle className="text-sm">Ticket Promedio Reparación</CardTitle>
                    <p className="text-xl font-semibold">${report.avgTicketRepair.toFixed(2)}</p>
                  </Card>

                </CardContent>
              </Card>

              {/* GASTOS */}
              <Card>
                <CardHeader>
                  <CardTitle>Gastos</CardTitle>
                </CardHeader>

                <CardContent className="grid md:grid-cols-3 gap-4">

                  <Card className="p-4">
                    <CardTitle className="text-sm">Gastos Fijos</CardTitle>
                    <p className="text-xl font-semibold text-red-600">${report.totalFixed.toFixed(2)}</p>
                  </Card>

                  <Card className="p-4">
                    <CardTitle className="text-sm">Gastos Variables</CardTitle>
                    <p className="text-xl font-semibold text-red-600">${report.totalVariable.toFixed(2)}</p>
                  </Card>

                  <Card className="p-4">
                    <CardTitle className="text-sm">Gastos Totales</CardTitle>
                    <p className="text-xl font-semibold text-red-600">${report.totalExpenses.toFixed(2)}</p>
                  </Card>

                </CardContent>
              </Card>

              {/* UTILIDADES */}
              <Card>
                <CardHeader>
                  <CardTitle>Utilidades</CardTitle>
                </CardHeader>

                <CardContent className="grid md:grid-cols-2 gap-4">

                  <Card className="p-4">
                    <CardTitle className="text-sm">Utilidad Bruta</CardTitle>
                    <p className="text-xl font-semibold">${report.grossProfit.toFixed(2)}</p>
                  </Card>

                  <Card className="p-4">
                    <CardTitle className="text-sm">Utilidad Neta</CardTitle>
                    <p className="text-xl font-semibold">${report.netProfit.toFixed(2)}</p>
                  </Card>

                </CardContent>
              </Card>

              {/* RESUMEN GRÁFICO */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumen Gráfico</CardTitle>
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

              {/* 📊 NUEVA GRÁFICA ANUAL */}
              <Card>
                <CardHeader>
                  <CardTitle>Ingresos por Mes del {year}</CardTitle>
                </CardHeader>

                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={report.monthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="productIncome" stroke="#2563eb" strokeWidth={3} name="Productos" />
                      <Line type="monotone" dataKey="serviceIncome" stroke="#16a34a" strokeWidth={3} name="Servicios" />
                      <Line type="monotone" dataKey="expenses" stroke="#dc2626" strokeWidth={3} name="Gastos" />
                      <Line type="monotone" dataKey="net" stroke="#7c3aed" strokeWidth={3} name="Utilidad Neta" />
                    </LineChart>
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
