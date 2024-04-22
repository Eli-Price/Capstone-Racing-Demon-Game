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
//import { game } from '../client/game_scripts/main.js';



const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {
        //maxDisconnectionDuration: 10000
    },
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true
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
console.log(path.join(__dirname, '../client'));
app.use(express.static(path.join(__dirname, '../dist')));
app.use(express.static(path.join(__dirname, '../assets')));


app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../client/pages/index.html'));
});



io.on('connection', (socket) => {
    const userID = socket.handshake.auth.userID;
    const roomID = socket.handshake.auth.roomID;

    // Find the session for the user
    let session = sessionStore.findSession(userID);
    let gameEnded = false;
 
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
            allCards: socket.allCards,
        });
    }

    socket.on('disconnect', () => {
        console.log(roomID);
        console.log('user ' + userID + ' disconnected');
        console.log('Player Count: ' + sessionStore.getRoomPlayerCount(roomID) + ', Game Ended: ' + gameEnded);
        if (gameEnded == true) {
            sessionStore.removePlayerFromRoom(roomID, userID);
        }
        if (sessionStore.getRoomPlayerCount(roomID) === 1 && gameEnded == true) {
            console.log('deleting session and room');
            //sessionStore.removePlayerFromRoom(roomID, userID);
            sessionStore.clearEndPiles(roomID);
            sessionStore.setRoomInactive(roomID);
            //sessionStore.deleteRoom(roomID);
            sessionStore.deleteSession(userID);
        }
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
        const room = sessionStore.getRoom(roomID);
        let endPiles = sessionStore.getEndPiles(roomID);
        const allPlayersCards = room.players.map(playerID => {
            const session = sessionStore.findSession(playerID);
            return session.allCards;
        });
        // Sends out all piles, and ID of the player sending them
        socket.to(roomID).emit('recievePiles', userID, allPlayersCards, endPiles);
    });

    socket.on('sendPiles', (centerPilesData, drawPileData, demonPileData, deckPileData) => {
        //console.log('Updating piles');

        updateCards(socket.allCards, centerPilesData, drawPileData, demonPileData, deckPileData);
        const room = sessionStore.getRoom(roomID);
        let endPiles = sessionStore.getEndPiles(roomID);
        room.players.forEach((playerID) => {
            // Find the session for the player
            let session = sessionStore.findSession(playerID);
    
            // If the session exists and the session's userID matches the socket's userID
            if (session && session.userID === socket.userID) {
                // Update the session's allCards property
                session.allCards = socket.allCards;
            }
        });
        const allPlayersCards = room.players.map(playerID => {
            const session = sessionStore.findSession(playerID);                     
            return session.allCards;
        });
        
        socket.to(roomID).emit('recievePiles', userID, allPlayersCards, endPiles);
    });

    socket.on('sendEndCard', (card, i, j) => {
        let endPiles = sessionStore.getEndPiles(roomID);
        sessionStore.setEndPile(roomID, i, j, card);

        const room = sessionStore.getRoom(roomID);
        const allPlayersCards = room.players.map(playerID => {
            const session = sessionStore.findSession(playerID);
            return session.allCards;
        });
        console.log(endPiles);
        socket.to(roomID).emit('recievePiles', userID, allPlayersCards, endPiles);
    });

    socket.on('returnPiles', () => {
        //console.log(gameEnded);
        if (gameEnded) return;
        const room = sessionStore.getRoom(roomID);
        let endPiles = sessionStore.getEndPiles(roomID);
        const allPlayersCards = room.players.map(playerID => {
            const session = sessionStore.findSession(playerID);
            //console.log(session.allCards);
            return session.allCards;
        });
        socket.to(roomID).emit('recievePiles', userID, allPlayersCards, endPiles);
    });

    socket.on('checkGameOver', () => {
        const isGameOver = true; // logic to check if the game is over later
        //console.log('writing');
        const room = sessionStore.getRoom(roomID);
        let demonPiles = [];
        room.players.forEach(playerID => {
            const session = sessionStore.findSession(playerID);
            demonPiles.push(session.allCards.demonPile); // assuming each session has a demonPile property
            //console.log(demonPiles);
        });

        for (let i = 0; i < demonPiles.length; i++) {
            if (demonPiles[i] == 0) {
                isGameOver = true;
                break;
            }
        }

        if (isGameOver) {
            const endPiles = sessionStore.getEndPiles(roomID);
            let flattenedEndPiles = endPiles.flat(2);

            // replace with your logic to calculate the scores
            let scores = [];
            let winner = '';
            room.players.forEach((playerID, index) => {
                scores[index] = flattenedEndPiles.filter(card => card.owner === playerID).length - demonPiles[index].length;
                if (scores[index] === Math.max(...scores)) {
                    winner = playerID;
                }
            });

            let data = {
                scores,
                gameOver: isGameOver,
                winner,
            }

            const allPlayersCards = room.players.map(playerID => {
                const session = sessionStore.findSession(playerID);
                //console.log(session.allCards);
                return session.allCards;
            });
            socket.to(roomID).emit('recievePiles', userID, allPlayersCards, endPiles);

            socket.to(roomID).emit('gameOver', data);
            gameEnded = true;
            //socket.removeAllListeners();
        }
        //socket.to(roomID).emit('gameOver', data);
    });
    
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


function updateCards(allCards, centerPilesData, drawPileData, demonPileData, deckPileData) {
    // This is very functional now

    // Clear the existing arrays
    allCards.centerPile1.length = 0;
    allCards.centerPile2.length = 0;
    allCards.centerPile3.length = 0;
    allCards.centerPile4.length = 0;

    allCards.drawPile.length = 0;
    allCards.demonPile.length = 0;
    allCards.deckPile.length = 0;

    for (let i = 0; i < centerPilesData.length; i++) {
        for (let j = 0; j < centerPilesData[i].length; j++) {
            allCards.centerPiles[i].push(allCards.deck.cards.find(card => card.name === centerPilesData[i][j].name));
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

    //console.log('updating');
}

function createAllCards(playerId) {
    let allCards = {
        centerPiles : [[],[],[],[]],
        endPiles : [[],[],[],[]],

        centerPile1 : [],
        centerPile2 : [],
        centerPile3 : [],
        centerPile4 : [],

        drawPile : [],
        demonPile : [],
        deckPile : [],

        deck: new Deck(playerId)
    }

    allCards.centerPiles = [allCards.centerPile1, allCards.centerPile2, allCards.centerPile3, allCards.centerPile4];

    allCards.deck.Deal(allCards.centerPiles, allCards.endPiles, allCards.demonPile, allCards.deckPile);

    return allCards;
}

