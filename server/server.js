import express from 'express';
import path from 'path'
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
//import sqlite3 from 'sqlite3';
//import { open } from 'sqlite';

//console.log('Hi! I am a server')

const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {
        maxDisconnectionDuration: 10000
    },
    //adapter: createAdapter()
});

// Create arrays to store the cards in each center pile
let centerPile1 = [];
let centerPile2 = [];
let centerPile3 = [];
let centerPile4 = [];

// Create arrays to store the cards in each center pile
let endPile1 = [];
let endPile2 = [];
let endPile3 = [];
let endPile4 = [];

// Create arrays to store the piles
let centerPiles = [centerPile1, centerPile2, centerPile3, centerPile4];
let endPiles = [endPile1, endPile2, endPile3, endPile4];
let drawPile = [];
let demonPile = [];
let deckPile = [];

const __dirname = dirname(fileURLToPath(import.meta.url));
console.log(__dirname);

// I'm not really sure if I should use these, don't know yet. Will need to change quite a bit if I don't, I think.
app.use(express.static(path.join(__dirname, '../client')));
//app.use(express.static(path.join(__dirname, '../dist')));
app.use(express.static(path.join(__dirname, '../assets')));


app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../client/pages/index.html'));
});


io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });

    socket.on('joinRoom', (roomId) => {
        console.log('Joining room ' + roomId);
        //socket.join(roomId);
    })

    socket.on('sendPiles', (data) => {
        console.log('Updating piles');
        console.log(data);
        socket.emit('recievePiles', data);
    });
});


server.listen(3000, () => {
    console.log('listening on localhost:3000');
  });

/*const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});*/