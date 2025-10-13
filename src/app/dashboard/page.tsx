import LogoutButton from "./components/logoutButton";

export default function Dashboard() {
  return (
    <main className="flex flex-col items-center justify-center h-screen bg-green-100 gap-6">
      <h1 className="text-3xl font-bold text-green-700">
        Bienvenido al Punto de Venta
      </h1>
      <LogoutButton />
    </main>
  );
}
