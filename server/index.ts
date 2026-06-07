import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function startServer() {
  const express = (await import('express')).default;
  const { createServer } = await import('http');
  const { Server: SocketServer } = await import('socket.io');
  const next = (await import('next')).default;
  const { registerSocketHandlers } = await import('./socket-handlers');

  const dev = process.env.NODE_ENV !== 'production';
  const hostname = process.env.HOSTNAME || 'localhost';
  const port = parseInt(process.env.PORT || '3000', 10);

  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  await app.prepare();

  const server = express();
  const httpServer = createServer(server);

  // Attach Socket.IO to the HTTP server
  const io = new SocketServer(httpServer, {
    path: '/api/socketio',
    cors: {
      origin: dev ? '*' : process.env.NEXTAUTH_URL,
      methods: ['GET', 'POST'],
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  // Register all socket event handlers
  registerSocketHandlers(io);

  // Forward all HTTP requests to Next.js
  server.all('*any', (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(port, () => {
    console.log(`
  ┌──────────────────────────────────────┐
  │                                      │
  │   🌙 THE REVEAL                      │
  │   Running on http://${hostname}:${port}    │
  │   Mode: ${dev ? 'development' : 'production'}                │
  │   Socket.IO: /api/socketio           │
  │                                      │
  └──────────────────────────────────────┘
    `);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
