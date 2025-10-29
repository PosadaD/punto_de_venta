"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RepairForm from "./repairForm";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react"; // Icono de carga

export default function RepairDetailPage() {
  const { id } = useParams();
  const [repair, setRepair] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

   useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const fetchRepair = async () => {
      try {
        const res = await fetch(`/api/repairs/${id}`);
        const data = await res.json();
        setRepair(data);
      } catch (err) {
        console.error("Error fetching repair:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRepair();
  }, [id]);

  if (loading) return (
    <div className="p-6 flex justify-center items-center">
      <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      <span className="ml-2 text-gray-500">Cargando reparación...</span>
    </div>
  );

  if (!repair) return <div className="p-6 text-red-500">No se encontró la reparación</div>;

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Folio: {repair.saleCode}</CardTitle>
        </CardHeader>
        
        {/* Información de reparación en un contenedor */}
        <div className="p-6 space-y-2 text-sm">
          <div>
            <strong>Cliente:</strong> {repair.customer?.name}
          </div>
          <div>
            <strong>Teléfono:</strong> {repair.customer?.phone}
          </div>
          <div>
            <strong>Marca:</strong> {repair.brand}
          </div>
          <div>
            <strong>Modelo:</strong> {repair.model}
          </div>
          <div>
            <strong>Descripción:</strong> {repair.description}
          </div>
          <div>
            <strong>Estado actual:</strong> 
            <Badge variant="outline" className="ml-2">{repair.status}</Badge>
          </div>
          <div>
            <strong>Nota de Revision:</strong> {repair.revision}
          </div>
        </div>
        
        <CardFooter>
          {/* Componente para cambiar estado */}
          <RepairForm repair={repair} setRepair={setRepair} userRoles={user.roles}/>
        </CardFooter>
      </Card>
    </div>
  );
}
