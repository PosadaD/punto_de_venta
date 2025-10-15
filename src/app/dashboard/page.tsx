
'use client'; // Esto es necesario para usar hooks como useRouter

import { useRouter } from 'next/navigation';
import Image from 'next/image';
  
export default function Dashboard() {
  const router = useRouter();

  const handleRedirect = () => {
    // Redirigir a /dashboard/users
    router.push('/dashboard/users');
  };

  return (
    <main className="flex flex-col items-center box-border justify-center h-full">
      <Image src="/logo.png" width={500} height={500} alt='logo Fenix'/>
    </main>
  );
}
