"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Repair = {
  _id: string;
  title: string;
  customer: {
    name: string;
    phone: string;
  };
  status: string;
  remainingBalance: number;
  createdAt: string;
};

type TechnicianGroup = {
  technician: {
    _id: string;
    username: string;
  };
  repairs: Repair[];
};

export default function TechniciansPage() {
  const [data, setData] = useState<TechnicianGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/technicians/repairs");
      const json = await res.json();
      setData(json);
      setLoading(false);
    }
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "secondary";
      case "in_progress":
        return "default";
      case "completed":
        return "outline";
      case "delivered":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) return <div className="p-6">Cargando...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Panel de Técnicos
      </h1>

      {data.map((group) => (
        <Card key={group.technician._id}>
          <CardContent className="p-4 space-y-4">

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {group.technician.username}
              </h2>

              <Badge>
                {group.repairs.length} servicios
              </Badge>
            </div>

            {group.repairs.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No tiene servicios asignados
              </div>
            )}

            <div className="space-y-3">
              {group.repairs.map((r) => (
                <div
                  key={r._id}
                  className="border rounded p-3 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">
                      {r.title}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {r.customer.name} • {r.customer.phone}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {r.brand} • {r.model}
                    </div>

                    <div className="font-medium">
                      {r.description}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={getStatusColor(r.status)}>
                      {r.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

          </CardContent>
        </Card>
      ))}
    </div>
  );
}
