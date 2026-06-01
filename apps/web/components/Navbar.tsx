'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-gray-800 bg-gray-950 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="text-white font-semibold text-lg tracking-tight">
          PingBoard
        </Link>

        <div className="flex items-center gap-4">
          {user?.avatarUrl && (
            <img
              src={user.avatarUrl}
              alt={user.name ?? 'User'}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-gray-400 text-sm">{user?.name}</span>
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}