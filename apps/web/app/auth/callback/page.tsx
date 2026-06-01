'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setToken } from '../../../lib/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setToken(token);
      router.replace('/dashboard');
    } else {
      router.replace('/');
    }
  }, [router, searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <p className="text-gray-400">Signing you in...</p>
    </main>
  );
}