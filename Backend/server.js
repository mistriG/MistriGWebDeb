import http from 'http';
import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3002;

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
