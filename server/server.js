import express from 'express';
import path from 'path'
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
//import sqlite3 from 'sqlite3';
//import { open } from 'sqlite';

console.log('Hello World!');
console.log('Hi! I am a server')

const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {
        maxDisconnectionDuration: 10000
    },
    //adapter: createAdapter()
});

const __dirname = dirname(fileURLToPath(import.meta.url));
console.log(__dirname);

// I'm not really sure if I should use these, don't know yet. Will need to change quite a bit if I don't, I think.
app.use(express.static(path.join(__dirname, '../client')));
app.use(express.static(path.join(__dirname, '../dist')));
app.use(express.static(path.join(__dirname, '../assets')));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../client/pages/index.html'));
    console.log('connected and served index.html');
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});