'use client';
import { PropsWithChildren, useEffect, useContext } from 'react';
import { usePathname, redirect } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuthStore } from '@/zustand/authStore';
import { SocketContext } from '@/contexts/socketContext';

export default function AuthGuard({ children }: PropsWithChildren) {
  const { setItem } = useLocalStorage('crm-path');
  const { clearEchoInstance } = useContext(SocketContext);
  const { token, isAdmin, permissionNames, logout } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    if (!token) {
      clearEchoInstance();
      redirect('/login');
    }
  }, [token]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'crms-auth') {
        const newValue = event.newValue;
        if (newValue) {
          const {
            state: { token: storageToken },
          } = JSON.parse(newValue);
          if (token && !storageToken) {
            clearEchoInstance();
            logout();
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const pathName = pathname.split('-').join(' ');
    if (
      !isAdmin &&
      pathName !== '/' &&
      !permissionNames?.some((name) => new RegExp(name).exec(pathName))
    ) {
      throw new Error('Permission denied', { cause: 403 });
    } else {
      setItem(pathname);
    }
  }, [pathname, permissionNames]);

  return children;
}
