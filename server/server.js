import express from 'express';
import path from 'path'
import crypto from 'crypto';
import { instrument } from '@socket.io/admin-ui';
import { InMemorySessionStore } from './sessionStore.js';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
//import sqlite3 from 'sqlite3';
//import { open } from 'sqlite';
import { Deck } from './deck.js';



const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {
        maxDisconnectionDuration: 10000
    }
    //adapter: createAdapter()
});

// It doesn't work
instrument(io, { auth: false });

const sessionStore = new InMemorySessionStore();

const __dirname = dirname(fileURLToPath(import.meta.url));
//console.log(__dirname);

// I'm not really sure if I should use these, don't know yet. Will need to change quite a bit if I don't, I think.
//  maybe it's bad practice, but gonna use it for now.
app.use(express.static(path.join(__dirname, '../client')));
//app.use(express.static(path.join(__dirname, '../dist')));
app.use(express.static(path.join(__dirname, '../assets')));


app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../client/pages/index.html'));
});



io.on('connection', (socket) => {
    const userID = socket.handshake.auth.userID;
    const roomID = socket.handshake.auth.roomID;

    // Find the session for the user
    let session = sessionStore.findSession(userID);

    // If the session exists and the roomID matches
    if (session && session.roomID === roomID) {
        // Restore the allCards object from the session
        socket.allCards = session.allCards;
    } else {
        // Create a new allCards object for the user
        socket.allCards = createAllCards(userID);

        // Store the new session
        sessionStore.saveSession(userID, {
            userID: userID,
            roomID: roomID,
            allCards: socket.allCards
        });
    }

    socket.on('disconnect', () => {
        console.log('user ' + userID + ' disconnected');
    });

    socket.on('createGame', ({ roomID }) => {
        sessionStore.createRoom(roomID);
    });

    socket.on('joinGame', ({ roomID }, callback) => {
        if (sessionStore.isRoomActive(roomID)) {
            console.log('User: ' + userID + ', Joining room ' + roomID);
            callback({ success: true });
            socket.join(roomID);
            console.log(io.sockets.adapter.rooms.get(roomID));
            console.log(socket.rooms);
            sessionStore.addPlayerToRoom(roomID, userID);
            socket.to(roomID).emit('userJoined', 'A new user has joined the room');
        } else {
            callback({ success: false, message: 'Room does not exist' });
        }
    });

    socket.on('dealCards', () => {
        //let playerCards = createAllCards(userID);
        //console.log(socket.allCards.centerPile1);
        const room = sessionStore.getRoom(roomID);
        const allPlayersCards = room.players.map(playerID => {
            const session = sessionStore.findSession(playerID);
            //console.log(session.allCards);
            return session.allCards;
        });
        //console.log(allPlayersCards)
        // Sends out all piles, and ID of the player sending them
        socket.to(roomID).emit('recievePiles', userID, allPlayersCards);
        /*socket.emit('recievePiles', socket.allCards.centerPiles, socket.allCards.endPiles, socket.allCards.drawPile, 
                        socket.allCards.demonPile, socket.allCards.deckPile);*/
    });

    socket.on('sendPiles', (centerPilesData, endPilesData, drawPileData, demonPileData, deckPileData) => {
        //console.log('Updating piles');

        updateCards(socket.allCards, centerPilesData, endPilesData, drawPileData, demonPileData, deckPileData);
        const room = sessionStore.getRoom(roomID);
        const allPlayersCards = room.players.map(playerID => {
            const session = sessionStore.findSession(playerID);
            //console.log(session.allCards);
            return session.allCards;
        });
        //console.log(allPlayersCards)
        allPlayersCards.forEach(allCards => {
            console.log(allCards.deck.userID);
        });
        //console.log(userID);
        socket.to(roomID).emit('recievePiles', userID, allPlayersCards);
        /*socket.emit('recievePiles', socket.allCards.centerPiles, socket.allCards.endPiles, socket.allCards.drawPile, 
                        socket.allCards.demonPile, socket.allCards.deckPile);*/
    });

    socket.on('returnPiles', () => {;
        const room = sessionStore.getRoom(roomID);
        const allPlayersCards = room.players.map(playerID => {
            const session = sessionStore.findSession(playerID);
            //console.log(session.allCards);
            return session.allCards;
        });
        //console.log(allPlayersCards)
        /*allPlayersCards.forEach(allCards => {
            console.log(allCards.deck.userID);
        });*/
        //console.log('BREAK');
        socket.to(roomID).emit('recievePiles', userID, allPlayersCards);
        /*socket.emit('recievePiles', socket.allCards.centerPiles, socket.allCards.endPiles, socket.allCards.drawPile, 
                        socket.allCards.demonPile, socket.allCards.deckPile);*/
    });
});


/*server.listen(3000, () => {
    console.log('listening on localhost:3000');
});*/


const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

function updateCards(allCards, centerPilesData, endPilesData, drawPileData, demonPileData, deckPileData) {
    // This is starting to reach functionality

    //console.log(centerPilesData[0][0].name);
    //console.log(demonPileData[0].name);

    // Clear the existing arrays
    allCards.centerPile1.length = 0;
    allCards.centerPile2.length = 0;
    allCards.centerPile3.length = 0;
    allCards.centerPile4.length = 0;

    allCards.endPile1.length = 0;
    allCards.endPile2.length = 0;
    allCards.endPile3.length = 0;
    allCards.endPile4.length = 0;

    allCards.drawPile.length = 0;
    allCards.demonPile.length = 0;
    allCards.deckPile.length = 0;

    //console.log(endPilesData);

    for (let i = 0; i < centerPilesData.length; i++) {
        for (let j = 0; j < centerPilesData[i].length; j++) {
            allCards.centerPiles[i].push(allCards.deck.cards.find(card => card.name === centerPilesData[i][j].name));
        }
    }
    for (let i = 0; i < endPilesData.length; i++) {
        for (let j = 0; j < endPilesData[i].length; j++) {
            allCards.endPiles[i].push(allCards.deck.cards.find(card => card.name === endPilesData[i][j].name));
        }
    }
    for (let i = 0; i < drawPileData.length; i++) {
        allCards.drawPile.push(allCards.deck.cards.find(card => card.name === drawPileData[i].name));
    }
    for (let i = 0; i < demonPileData.length; i++) {
        allCards.demonPile.push(allCards.deck.cards.find(card => card.name === demonPileData[i].name));
    }
    for (let i = 0; i < deckPileData.length; i++) {
        allCards.deckPile.push(allCards.deck.cards.find(card => card.name === deckPileData[i].name));
    }

    console.log('updating');
}

function createAllCards(playerId) {
    let allCards = {
        centerPiles : [[],[],[],[]],
        endPiles : [[],[],[],[]],

        centerPile1 : [],
        centerPile2 : [],
        centerPile3 : [],
        centerPile4 : [],

        endPile1 : [],
        endPile2 : [],
        endPile3 : [],
        endPile4 : [],

        drawPile : [],
        demonPile : [],
        deckPile : [],

        deck: new Deck(playerId)
    }

    allCards.centerPiles = [allCards.centerPile1, allCards.centerPile2, allCards.centerPile3, allCards.centerPile4];
    allCards.endPiles = [allCards.endPile1, allCards.endPile2, allCards.endPile3, allCards.endPile4];

    allCards.deck.Deal(allCards.centerPiles, allCards.endPiles, allCards.demonPile, allCards.deckPile);

    return allCards;
}