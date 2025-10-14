
'use client'; // Esto es necesario para usar hooks como useRouter

import { useRouter } from 'next/navigation';
import LogoutButton from "./components/logoutButton";
import Link from 'next/link';
  
export default function Dashboard() {
  const router = useRouter();

  const handleRedirect = () => {
    // Redirigir a /dashboard/users
    router.push('/dashboard/users');
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-green-100 gap-6">
      <h1 className="text-3xl font-bold text-green-700">
        Bienvenido al Punto de Venta
      </h1>
      <button className='bg-black' onClick={handleRedirect}>Ir a Usuarios</button>
      <LogoutButton />
    </main>
  );
}
