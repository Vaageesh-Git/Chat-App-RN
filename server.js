/**
 * Simple Node.js Mock Backend Server for Chat App
 * Runs with standard Node.js (no extra npm packages required)
 * 
 * Usage:
 *   node server.js
 */

const http = require('http');
const url = require('url');

const PORT = 3000;

// In-memory data store
let users = [
    { id: 1, name: 'Vaibhav Sir', bio: 'Course Instructor' },
    { id: 2, name: 'Vaageesh', bio: 'Building React Native Chat App' },
    { id: 3, name: 'Aarav Sharma', bio: 'Mobile App Developer' },
    { id: 4, name: 'Priya Patel', bio: 'UI/UX Designer' },
    { id: 5, name: 'Rohan Verma', bio: 'Full-stack Engineer' },
];

let conversations = [
    {
        id: 1,
        name: 'General Discussion',
        type: 'GROUP',
        createdBy: 1,
        participants_ids: [1, 2, 3, 4],
    },
    {
        id: 2,
        name: 'Mobile App Project Team',
        type: 'GROUP',
        createdBy: 2,
        participants_ids: [2, 3],
    },
];

let messages = [
    {
        id: 'msg-1',
        conversation_id: 1,
        content: 'Welcome to the Chat App! The backend server is running successfully.',
        isMe: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
        id: 'msg-2',
        conversation_id: 1,
        content: 'Hello everyone! Real-time messaging test from React Native.',
        isMe: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
];

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        });
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    console.log(`${req.method} ${pathname}`);

    // GET /user
    if (req.method === 'GET' && pathname === '/user') {
        return sendJson(res, 200, users);
    }

    // GET /user/profile?user_id=1
    if (req.method === 'GET' && pathname === '/user/profile') {
        const userId = parseInt(query.user_id, 10);
        const user = users.find((u) => u.id === userId) || { id: userId, name: `User ${userId}`, bio: 'Available' };
        return sendJson(res, 200, user);
    }

    // GET /conversation
    if (req.method === 'GET' && pathname === '/conversation') {
        return sendJson(res, 200, conversations);
    }

    // POST /conversation
    if (req.method === 'POST' && pathname === '/conversation') {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const newConv = {
                    id: Date.now(),
                    name: data.name || 'New Conversation',
                    type: data.type || 'DM',
                    createdBy: 2,
                    participants_ids: data.participants_ids || [],
                };
                conversations.unshift(newConv);
                return sendJson(res, 201, newConv);
            } catch (e) {
                return sendJson(res, 400, { error: 'Invalid JSON body' });
            }
        });
        return;
    }

    // GET /message?conversation_id=1
    if (req.method === 'GET' && pathname === '/message') {
        const convId = parseInt(query.conversation_id, 10);
        const filtered = messages.filter((m) => m.conversation_id === convId);
        return sendJson(res, 200, filtered);
    }

    // POST /message
    if (req.method === 'POST' && pathname === '/message') {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const newMsg = {
                    id: `msg-${Date.now()}`,
                    conversation_id: parseInt(data.conversation_id, 10),
                    content: data.content || '',
                    imageInfo: data.imageInfo || null,
                    isMe: true,
                    createdAt: new Date().toISOString(),
                };
                messages.push(newMsg);
                return sendJson(res, 201, newMsg);
            } catch (e) {
                return sendJson(res, 400, { error: 'Invalid JSON body' });
            }
        });
        return;
    }

    // 404
    sendJson(res, 404, { error: 'Endpoint not found' });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Chat Backend Server running at http://0.0.0.0:${PORT}`);
    console.log(`Endpoints available:`);
    console.log(`  - GET  /user`);
    console.log(`  - GET  /user/profile?user_id=1`);
    console.log(`  - GET  /conversation`);
    console.log(`  - POST /conversation`);
    console.log(`  - GET  /message?conversation_id=1`);
    console.log(`  - POST /message\n`);
});
