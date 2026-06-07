'use client';

import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';

export function useSocket() {
  const socketRef = useRef(getSocket());

  useEffect(() => {
    const s = connectSocket();
    socketRef.current = s;

    return () => {
      // We don't disconnect on component unmount in case other components share it,
      // but let's make sure it's accessible.
    };
  }, []);

  return socketRef.current;
}
