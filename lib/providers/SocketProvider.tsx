'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeUsers: Set<string>;
  typingUsers: Map<string, Set<string>>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  activeUsers: new Set(),
  typingUsers: new Map(),
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());

  useEffect(() => {
    if (!session?.user?.email) return;

    // Connect to Socket.io server
    const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      
      // Join with user email
      socketInstance.emit('user:join', session.user?.email);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('user:online', (data: { userId: string }) => {
      setActiveUsers(prev => new Set([...prev, data.userId]));
    });

    socketInstance.on('user:offline', (data: { userId: string }) => {
      setActiveUsers(prev => {
        const updated = new Set(prev);
        updated.delete(data.userId);
        return updated;
      });
    });

    socketInstance.on('typing:indicator', (data: {
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      setTypingUsers(prev => {
        const updated = new Map(prev);
        if (!updated.has(data.conversationId)) {
          updated.set(data.conversationId, new Set());
        }
        
        if (data.isTyping) {
          updated.get(data.conversationId)!.add(data.userId);
        } else {
          updated.get(data.conversationId)!.delete(data.userId);
        }
        
        return updated;
      });
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session?.user?.email]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, activeUsers, typingUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}
