// Scripts for updating the gamestate and communicating with the server
import { Deck } from './deck.js';
import { renderCards, renderEndCards } from './render.js';
import { socket } from './main.js';
import { centerPileX, centerPileY, endPileX, endPileY } from './card_config.js';


// Sends the users gamestate to the server
export function sendPiles(scene, allCards) {
  //console.log(allCards.centerPiles);
  let centerPilesData = [[],[],[],[]];
  let endPilesData = [[],[],[],[]];
  let drawPileData = [];
  let demonPileData = [];
  let deckPileData = [];

  for (let i = 0; i < allCards.centerPiles.length; i++) {
     for (let j = 0; j < allCards.centerPiles[i].length; j++) {
        let pileData = {name : '', suit : 0, value : 0};
        pileData.name = allCards.centerPiles[i][j].getAt(2).name;
        pileData.suit = allCards.centerPiles[i][j].getAt(2).suit;
        pileData.value = allCards.centerPiles[i][j].getAt(2).value;
        
        centerPilesData[i][j] = pileData;
     }
  };

  for (let i = 0; i < allCards.drawPile.length; i++) {
     let pileData = {name : '', suit : 0, value : 0};
     pileData.name = allCards.drawPile[i].getAt(2).name;
     pileData.suit = allCards.drawPile[i].getAt(2).suit;
     pileData.value = allCards.drawPile[i].getAt(2).value;

     drawPileData[i] = pileData;
  };

  for (let i = 0; i < allCards.demonPile.length; i++) {
     let pileData = {name : '', suit : 0, value : 0};
     pileData.name = allCards.demonPile[i].getAt(2).name;
     pileData.suit = allCards.demonPile[i].getAt(2).suit;
     pileData.value = allCards.demonPile[i].getAt(2).value;

     demonPileData[i] = pileData;
  };

  for (let i = 0; i < allCards.deckPile.length; i++) {
     let pileData = {name : '', suit : 0, value : 0};
     pileData.name = allCards.deckPile[i].getAt(2).name;
     pileData.suit = allCards.deckPile[i].getAt(2).suit;
     pileData.value = allCards.deckPile[i].getAt(2).value;

     deckPileData[i] = pileData;
  };

  socket.emit('sendPiles', centerPilesData, drawPileData, demonPileData, deckPileData);
}

// Recieves the gamestate sent from the server and updates the client
//   This has a few to many parameters for my liking, but it is probably the best way
export function updatePiles(scene, allCards, deck, centerPilesData, endPilesData, drawPileData, 
                              demonPileData, deckPileData, canRender) {

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

  for (let i = 0; i < centerPilesData.length; i++) {
     for (let j = 0; j < centerPilesData[i].length; j++) {
        allCards.centerPiles[i].push(deck.cards.find(card => card.getAt(2).name === centerPilesData[i][j].name));
     }
  }
  for (let i = 0; i < endPilesData.length; i++) {
     for (let j = 0; j < endPilesData[i].length; j++) {
        allCards.endPiles[i].push(deck.cards.find(card => card.getAt(2).name === endPilesData[i][j].name));
     }
  }
  for (let i = 0; i < drawPileData.length; i++) {
     allCards.drawPile.push(deck.cards.find(card => card.getAt(2).name === drawPileData[i].name));
  }
  for (let i = 0; i < demonPileData.length; i++) {
     allCards.demonPile.push(deck.cards.find(card => card.getAt(2).name === demonPileData[i].name));
  }
  for (let i = 0; i < deckPileData.length; i++) {
     allCards.deckPile.push(deck.cards.find(card => card.getAt(2).name === deckPileData[i].name));
  }
}

// Use to build objects that will store the cards for each player
export function createAllCards(scene, playerID) {
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

      deck: new Deck(scene, playerID)
  }

  allCards.centerPiles = [allCards.centerPile1, allCards.centerPile2, allCards.centerPile3, allCards.centerPile4];
  allCards.endPiles = [allCards.endPile1, allCards.endPile2, allCards.endPile3, allCards.endPile4];

  return allCards;
}


export function showGameOverPopup(p1Score, p2Score, p3Score, p4Score, winnerID, userID) {
   // Create a div for the popup
   let popup = document.createElement('div');
   popup.style.position = 'absolute';
   popup.style.top = '50%';
   popup.style.left = '50%';
   popup.style.transform = 'translate(-50%, -50%)';
   popup.style.backgroundColor = '#fff';
   popup.style.padding = '20px';
   popup.style.textAlign = 'center';
   popup.style.zIndex = '1000';
   
  console.log('writing');

  

  // Create a p element for the game over message
  let message = document.createElement('p');
  if (winnerID === userID) {
    message.textContent = 'You Won! The game has ended.';
  } else {
    message.textContent = 'You Lost. The game has ended.';
  }
  popup.appendChild(message);

  // Create p elements for each player's score
  /*let p1ScoreElement = document.createElement('p');
  p1ScoreElement.textContent = `Player 1 Score: ${p1Score}`;
  popup.appendChild(p1ScoreElement);

  let p2ScoreElement = document.createElement('p');
  p2ScoreElement.textContent = `Player 2 Score: ${p2Score}`;
  popup.appendChild(p2ScoreElement);

  let p3ScoreElement = document.createElement('p');
  if (p3Score === undefined) { p3Score = 0; }
  p3ScoreElement.textContent = `Player 3 Score: ${p3Score}`;
  popup.appendChild(p3ScoreElement);

  let p4ScoreElement = document.createElement('p');
  if (p4Score === undefined) { p4Score = 0; }
  p4ScoreElement.textContent = `Player 4 Score: ${p4Score}`;
  popup.appendChild(p4ScoreElement);*/

  // Create a button that redirects to the home page
  let button = document.createElement('button');
  button.textContent = 'Go to Home Page';
  button.onclick = function() {
    window.location.href = '../pages/index.html';
  };
  popup.appendChild(button);

  // Add the popup to the body
  document.body.appendChild(popup);

  
}