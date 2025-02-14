'use client';
import { useState, useEffect, createContext, PropsWithChildren } from 'react';
import Pusher from 'pusher-js';
import { useAuthStore } from '@/zustand/authStore';
import Echo from 'laravel-echo';

declare global {
  interface Window {
    Pusher: any;
  }
}

interface IResponse extends Response {
  data?: any;
}

window.Pusher = Pusher;

export const SocketContext = createContext<any>(null);

export function SocketContextProvider(props: PropsWithChildren) {
  const { token } = useAuthStore();
  const [echoInstance, setEchoInstance] = useState<any>(null);

  const clearEchoInstance = () => {
    if (echoInstance) {
      echoInstance.disconnect();
    }
    setEchoInstance(null);
  };

  useEffect(() => {
    if (token && !echoInstance) {
      const echo = new Echo({
        broadcaster: 'reverb',
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        authorizer: (channel: any) => {
          return {
            authorize: async (socketId: string, callback: any) => {
              try {
                const response: IResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: 'Bearer ' + token,
                    },
                    body: JSON.stringify({
                      socket_id: socketId,
                      channel_name: channel.name,
                    }),
                  }
                );
                const data = await response.json();
                callback(false, data);
              } catch (error) {
                callback(true, error);
              }
            },
          };
        },
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
        wsPort: process.env.NEXT_PUBLIC_REVERB_PORT,
        wssPort: process.env.NEXT_PUBLIC_REVERB_PORT,
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
      });
      setEchoInstance(echo);
    }
  }, [token]);

  return (
    <SocketContext.Provider value={{ echo: echoInstance, clearEchoInstance }}>
      {props.children}
    </SocketContext.Provider>
  );
}
