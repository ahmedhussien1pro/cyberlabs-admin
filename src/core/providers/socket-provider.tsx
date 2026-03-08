import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/core/store';
import { ENV } from '@/shared/constants';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection
    // We assume the backend gateway is at /notifications namespace
    const socketInstance = io(
      `${ENV.API_URL.replace('/api/v1', '')}/notifications`,
      {
        withCredentials: true,
        transports: ['websocket'],
        autoConnect: true,
        // Pass token in query if needed, or rely on cookie/header if supported by client
        // Since we use cookie httpOnly, we rely on browser sending cookies.
        // But for websocket handshake, standard cookies work if same-origin or CORS allowed.
        // If we stored token in localStorage (we do in persist store), we can pass it.
      },
    );

    // Attempt to get token from storage if needed for handshake auth
    const state = localStorage.getItem('cyberlabs-storage-auth');
    if (state) {
      try {
        const parsed = JSON.parse(state);
        const token = parsed.state?.tokens?.accessToken;
        if (token) {
          socketInstance.io.opts.query = { token };
        }
      } catch (e) {
        console.error('Failed to parse auth token for socket', e);
      }
    }

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
