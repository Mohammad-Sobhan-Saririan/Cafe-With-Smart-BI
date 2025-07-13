import { addClient, removeClient } from '../services/sseService.js';

export const eventsHandler = (req, res) => {
    const userId = req.user.id; // From our 'protect' middleware

    // Set headers for SSE
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);

    // Add this client to our list
    addClient(userId, res);

    // Send a confirmation message
    res.write('data: {"message": "Connection established"}\n\n');

    // When the client closes the connection, remove them from our list
    req.on('close', () => {
        removeClient(userId);
    });
};