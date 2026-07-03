'use client';

import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';

export interface InfrastructureMetricsStream {
  timestamp: string;
  backend: {
    status: 'up' | 'down' | 'degraded';
    latencyMs: number;
    socketConnections: number;
    activeRooms: number;
  };
  database: {
    status: 'connected' | 'disconnected';
    latencyMs: number;
    activeConnections: number;
  };
  frontend: {
    uptimeSeconds: number;
    memory: { rss: number; heapUsed: number; heapTotal: number };
    cpu: { user: number; system: number };
    eventLoopLagMs: number;
  };
}

export function useMonitoringSocket() {
  const socket = useSocket();
  const [infraMetrics, setInfraMetrics] = useState<InfrastructureMetricsStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
      socket.emit('admin:subscribe');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleInfraUpdate = (data: InfrastructureMetricsStream) => {
      setInfraMetrics(data);
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('admin:infra-update', handleInfraUpdate);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('admin:infra-update', handleInfraUpdate);
    };
  }, [socket]);

  return {
    socket,
    isConnected,
    infraMetrics,
  };
}
