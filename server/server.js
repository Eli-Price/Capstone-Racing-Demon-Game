import express from 'express';
import path from 'path'
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
const centerPiles = [centerPile1, centerPile2, centerPile3, centerPile4];
const endPiles = [endPile1, endPile2, endPile3, endPile4];
const drawPile = [];
const demonPile = [];
const deckPile = [];

let deck = new Deck(1);
deck.Deal(centerPiles, endPiles, demonPile, deckPile);

console.log(centerPiles);

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

    socket.once('dealCards', () => {
        console.log(centerPiles)
        console.log('Dealing cards');
        socket.emit('recievePiles', centerPiles, endPiles, drawPile, demonPile, deckPile);
    });

    socket.on('sendPiles', (centerPilesData, endPilesData, drawPileData, demonPileData, deckPileData) => {
        console.log('Updating piles');
        console.log(centerPilesData);
        console.log(endPilesData);

        // This is starting to reach functionality

        //console.log(centerPilesData[0][0].name);
        //console.log(demonPileData[0].name);

        // Clear the existing arrays
        centerPile1.length = 0;
        centerPile2.length = 0;
        centerPile3.length = 0;
        centerPile4.length = 0;

        endPile1.length = 0;
        endPile2.length = 0;
        endPile3.length = 0;
        endPile4.length = 0;

        drawPile.length = 0;
        demonPile.length = 0;
        deckPile.length = 0;

        //console.log(endPilesData);

        for (let i = 0; i < centerPilesData.length; i++) {
        for (let j = 0; j < centerPilesData[i].length; j++) {
            centerPiles[i].push(deck.cards.find(card => card.name === centerPilesData[i][j].name));
        }
        }
        for (let i = 0; i < endPilesData.length; i++) {
        for (let j = 0; j < endPilesData[i].length; j++) {
            endPiles[i].push(deck.cards.find(card => card.name === endPilesData[i][j].name));
        }
        }
        for (let i = 0; i < drawPileData.length; i++) {
        drawPile.push(deck.cards.find(card => card.name === drawPileData[i].name));
        }
        for (let i = 0; i < demonPileData.length; i++) {
        demonPile.push(deck.cards.find(card => card.name === demonPileData[i].name));
        }
        for (let i = 0; i < deckPileData.length; i++) {
        deckPile.push(deck.cards.find(card => card.name === deckPileData[i].name));
        }

        console.log('updating');
        console.log(centerPiles)

        socket.emit('recievePiles', centerPiles, endPiles, drawPile, demonPile, deckPile);
    });
});




server.listen(3000, () => {
    console.log('listening on localhost:3000');
  });

/*const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});*/

function updateCards(deck, centerPilesData, endPilesData, drawPileData, demonPileData, deckPileData) {
    // This is starting to reach functionality

    //console.log(centerPilesData[0][0].name);
    //console.log(demonPileData[0].name);

    // Clear the existing arrays
    centerPile1.length = 0;
    centerPile2.length = 0;
    centerPile3.length = 0;
    centerPile4.length = 0;

    endPile1.length = 0;
    endPile2.length = 0;
    endPile3.length = 0;
    endPile4.length = 0;

    drawPile.length = 0;
    demonPile.length = 0;
    deckPile.length = 0;

    //console.log(endPilesData);

    for (let i = 0; i < centerPilesData.length; i++) {
       for (let j = 0; j < centerPilesData[i].length; j++) {
          centerPiles[i].push(deck.cards.find(card => card.name === centerPilesData[i][j].name));
       }
    }
    for (let i = 0; i < endPilesData.length; i++) {
       for (let j = 0; j < endPilesData[i].length; j++) {
          endPiles[i].push(deck.cards.find(card => card.name === endPilesData[i][j].name));
       }
    }
    for (let i = 0; i < drawPileData.length; i++) {
       drawPile.push(deck.cards.find(card => card.name === drawPileData[i].name));
    }
    for (let i = 0; i < demonPileData.length; i++) {
       demonPile.push(deck.cards.find(card => card.name === demonPileData[i].name));
    }
    for (let i = 0; i < deckPileData.length; i++) {
       deckPile.push(deck.cards.find(card => card.name === deckPileData[i].name));
    }

    console.log('updating');
}