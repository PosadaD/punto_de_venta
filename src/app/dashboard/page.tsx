'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUsername(data.user.username); // Ajusta según tu payload del token
      }
    }
    fetchUser();
  }, []);

  return (
    <main className="flex flex-col items-center box-border justify-evenly h-full space-y-4">
      <div className='w-full h-16 flex justify-center'>
        {<h2 className="text-4xl font-bold text-center">Bienvenido, {username}</h2>}
      </div>
      {/* <Image src="/logo.png" width={500} height={500} alt='logo Fenix'/> */}
    </main>
  );
}
