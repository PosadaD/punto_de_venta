"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // opcional si tienes tailwind helpers
import LogoutButton from "./components/logoutButton";

const links = [
  { name: "Inicio", href: "/dashboard" },
  { name: "Usuarios", href: "/dashboard/users" },
  { name: "Ventas", href: "/dashboard/sales" },
  { name: "Inventario", href: "/dashboard/inventory" },
  { name: "Gastos/Compras", href: "/dashboard/expenses" },
  { name: "Reparaciones", href: "/dashboard/repairs" },
  { name: "Reportes", href: "/dashboard/reports" },
  { name: "Historial de ventas", href: "/dashboard/salesHistory" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold border-b border-gray-700">
          Punto de Venta
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block px-3 py-2 rounded-md hover:bg-gray-700 transition",
                pathname === link.href ? "bg-gray-700" : ""
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <form action="/api/auth/logout" method="POST">
           <LogoutButton></LogoutButton>
          </form>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
