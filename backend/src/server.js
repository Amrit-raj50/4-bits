import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './sockets/socket.js';

const configuredPort = Number.parseInt(process.env.PORT || '5000', 10);
const PORT = Number.isNaN(configuredPort) ? 5000 : configuredPort;

let server;

const startServer = (port) => {
  server = http.createServer(app);

  // Initialize Socket.IO
  initSocket(server);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Port ${port} is already in use. Trying ${nextPort} instead.`);
      startServer(nextPort);
      return;
    }

    throw err;
  });

  server.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
  });
};

// Connect to Database
connectDB();

// Start the server (ollama made public)
startServer(PORT);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
