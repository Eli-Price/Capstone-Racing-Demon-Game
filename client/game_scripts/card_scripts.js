// Scripts for updating the gamestate and communicating with the server
import { Deck } from './deck.js';
import { renderCards } from './render.js';
import { socket } from './main.js';
import { centerPileX, centerPileY, endPileX, endPileY } from './card_config.js';


// Sends the users gamestate to the server
export function sendPiles(allCards) {
  console.log(allCards.centerPiles);
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
        //console.log(centerPilesData[i][j]);
     }
  };

  // Plus 1s because there are fake continers in the endpiles for the transparent sprites that go on the bottom.
  for (let i = 0; i < allCards.endPiles.length; i++) {
     for (let j = 0; j < allCards.endPiles[i].length; j++) {
        let pileData = {name : '', suit : 0, value : 0};
        pileData.name = allCards.endPiles[i][j].getAt(2).name;
        pileData.suit = allCards.endPiles[i][j].getAt(2).suit;
        pileData.value = allCards.endPiles[i][j].getAt(2).value;

        endPilesData[i][j] = pileData;
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

  socket.emit('sendPiles', centerPilesData, endPilesData, drawPileData, demonPileData, deckPileData);
  //console.log("Test2")
}

// Recieves the gamestate sent from the server and updates the client
//   This has a few to many parameters for my liking, but it is probably the best way
export function updatePiles(scene, allCards, deck, centerPilesData, endPilesData, drawPileData, 
                              demonPileData, deckPileData, canRender) {
  //console.log(centerPilesData);

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

  //console.log('updating');
  if (canRender === true) {
    //let playerID = allCards.deck.userID;
    //renderCards(scene, allCards, scene.playerID, centerPileX, centerPileY, endPileX, endPileY);
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


export function showGameOverPopup() {
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

  // Create a p element for the game over message
  let message = document.createElement('p');
  message.textContent = 'The game has ended.';
  popup.appendChild(message);

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