"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type TipoEquipo = "celular" | "computadora"

function obtenerMultiplicador(tipo: TipoEquipo, precioEquipo: number) {
  if (tipo === "celular") {
    if (precioEquipo < 4000) return { gama: "Baja", mult: 2.8 }
    if (precioEquipo >= 4000 && precioEquipo < 6000)
      return { gama: "Media", mult: 2.4 }
    return { gama: "Alta", mult: 2 }
  }

  // Computadoras
  if (precioEquipo <= 8000) return { gama: "Baja", mult: 3 }
  if (precioEquipo > 8000 && precioEquipo <= 13000)
    return { gama: "Media", mult: 2.5 }
  return { gama: "Alta", mult: 2 }
}

function CotizacionCard({
  titulo,
  servicios,
  tipo,
}: {
  titulo: string
  servicios: string[]
  tipo: TipoEquipo
}) {
  const [servicio, setServicio] = useState("")
  const [costoInsumo, setCostoInsumo] = useState(0)
  const [costoEquipo, setCostoEquipo] = useState(0)

  const { gama, mult } = useMemo(
    () => obtenerMultiplicador(tipo, costoEquipo),
    [tipo, costoEquipo]
  )

  const total = costoInsumo * mult

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Tipo de servicio</Label>
          <Select onValueChange={setServicio}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un servicio" />
            </SelectTrigger>
            <SelectContent>
              {servicios.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Costo del insumo / refacción</Label>
          <Input
            type="number"
            onChange={(e) => setCostoInsumo(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label>Precio del equipo</Label>
          <Input
            type="number"
            onChange={(e) => setCostoEquipo(Number(e.target.value))}
          />
        </div>

        <Separator />

        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Gama detectada: <span className="font-medium">{gama}</span></p>
          <p>Multiplicador aplicado: <span className="font-medium">{mult}</span></p>
        </div>

        <div className="text-xl font-bold">
          Total: ${isNaN(total) ? 0 : total.toFixed(2)}
        </div>
      </CardContent>
    </Card>
  )
}

export default function CotizacionPage() {
  return (
    <div className="min-h-screen p-10 bg-muted">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Sistema de Cotización
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CotizacionCard
          titulo="Cotización de Celulares"
          tipo="celular"
          servicios={[
            "Cambio de pantalla",
            "Cambio de batería",
            "Cambio de bocinas",
            "Cambio de micrófono",
            "Cambio centro de carga",
          ]}
        />

        <CotizacionCard
          titulo="Cotización de Computadoras"
          tipo="computadora"
          servicios={[
            "Cambio de pantalla",
            "Cambio de teclado",
            "Cambio de batería",
            "Cambio de RAM",
            "Cambio de disco duro",
          ]}
        />
      </div>
    </div>
  )
}