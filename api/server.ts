/**
 * local server entry file, for local development
 */
import app from './app.js';
import { initDatabase } from './database/init.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('Initializing database...');
    await initDatabase();
    console.log('Database initialized successfully');
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      const address = server.address();
      const host = typeof address === 'string' ? address : address?.address;
      const port = typeof address === 'string' ? PORT : address?.port;
      console.log(`Server ready on http://${host}:${port}`);
      console.log(`Local access: http://localhost:${port}`);
      console.log(`Network access: http://0.0.0.0:${port}`);
    });
    
    /**
     * close server
     */
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('SIGINT signal received');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
