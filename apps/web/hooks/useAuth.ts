'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, clearToken } from '../lib/auth';
import { api } from '../lib/api';

interface User {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  email: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    api.monitors.list()
      .then(() => {
        // Token is valid — fetch user profile
        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(() => {
        clearToken();
        router.push('/');
      })
      .finally(() => setLoading(false));
  }, [router]);

  function logout() {
    clearToken();
    router.push('/');
  }

  return { user, loading, logout };
}