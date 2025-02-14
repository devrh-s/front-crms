'use client';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuthStore } from '@/zustand/authStore';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { token, login } = useAuthStore();
  const { getItem } = useLocalStorage('crm-path');

  useEffect(() => {
    if (token) {
      const pathname = getItem();
      redirect(pathname ?? '/');
    }
  }, [token]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'crms-auth') {
        const newValue = event.newValue;
        if (newValue) {
          const {
            state: { token: storageToken, permissions, isAdmin },
          } = JSON.parse(newValue);
          if (storageToken && !token) {
            login({ token: storageToken, permissions, isAdmin });
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return <>{children}</>;
}
