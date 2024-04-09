//import Phaser, { GameObjects, Textures } from './phaser';
import Card from './card.js';
//import crypto from 'crypto';
import { suits, values} from './card_config.js';
import { Deck } from './deck.js';
import { createDeckBottom } from './deck_bottom.js';
import { renderCards } from './render.js';
/*import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';*/


const roomID = localStorage.getItem('roomID');
const userID = localStorage.getItem('userID');
console.log(roomID);

const socket = io({
   auth: { 
      userID: localStorage.getItem('userID'),
      roomID: localStorage.getItem('roomID')
   }
});

socket.on('connect', () => {
   //let userID = localStorage.getItem('userID');
   if (!userID) {
      userID = socket.id;
      localStorage.setItem('userID', userID);
   }
   // This needs error handling
   socket.emit('joinGame', { roomID }, (response) => {
      if (response.success) {
         //socket.join(roomID);
        // If the server responded with success, navigate to the game page
        // window.location.href = `../pages/game.html`;
      } else {
        // If the server responded with an error, display the error message
        const errorMessage = document.createElement('p');
        errorMessage.textContent = response.message;
        //document.querySelector('.input-field').appendChild(errorMessage);
      }
   });
});


// Positions of the centerPiles
const centerPileX = [420, 540, 660, 780];
const centerPileY = 300;
const endPileX = [420, 540, 660, 780];
const endPileY = 120;

let deckBottom = [];

/*// Create arrays to store the cards in each center pile
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
const deckPile = [];*/

class PlaygroundScene extends Phaser.Scene {
   constructor() {
      super('playground');
      this.mousePositionText = null;
      this.demonPileCount = null;
      this.deckPileCount = null;
      this.gameTimer = 0;
      this.timeSinceLastMove = 0;
      this.canRender = true;
      this.decks = [];
   }

   preload() {
      this.load.spritesheet(
         'cardsSpades',
         '../assets/Top-Down/Cards/Spades-88x124.png',
         { frameWidth: 88, frameHeight: 124 }
      );
      this.load.spritesheet(
         'cardsClubs',
         '../assets/Top-Down/Cards/Clubs-88x124.png',
         { frameWidth: 88, frameHeight: 124 }
      );
      this.load.spritesheet(
         'cardsDiamonds',
         '../assets/Top-Down/Cards/Diamonds-88x124.png',
         { frameWidth: 88, frameHeight: 124 }
      );
      this.load.spritesheet(
         'cardsHearts',
         '../assets/Top-Down/Cards/Hearts-88x124.png',
         { frameWidth: 88, frameHeight: 124 }
      );
      this.load.spritesheet(
         'cardBacks',
         '../assets/Top-Down/Cards/Card_Back-88x124.png',
         { frameWidth: 88, frameHeight: 124 }
      );
      this.load.spritesheet(
         'cardsDecks',
         '../assets/Top-Down/Cards/Card_DeckA-88x140.png',
         { frameWidth: 88, frameHeight: 140 }
      );
   }

   create() {
      this.cameras.main.setBackgroundColor('#408080');
      createDeckBottom(this);

      this.mousePositionText = this.add.text(10, 10, '', { font: '16px Courier', fill: '#ffffff' });
      this.demonPileCount = this.add.text(220, 215, '', { font: '16px Courier', fill: '#ffffff' });
      this.deckPileCount = this.add.text(92, 40, '', { font: '16px Courier', fill: '#ffffff' });

      // Draw the places cards can be placed
      for (let i = 0; i < centerPileX.length; i++) {
         deckBottom.push(this.add.sprite(centerPileX[i], centerPileY - 180, 'cards' + suits[i], 0).setTint(0x408080));
         deckBottom[i].setDepth(0);
      }
      for (let i = 0; i < centerPileX.length; i++) {
         deckBottom.push(this.add.sprite(centerPileX[i], centerPileY, 'deckBottomTexture'));
      }
      deckBottom.push(this.add.sprite(100, endPileY, 'deckBottomTexture'));
      deckBottom.push(this.add.sprite(230, endPileY, 'deckBottomTexture'));
      deckBottom.push(this.add.sprite(230, centerPileY, 'deckBottomTexture'));

      let deckSprite = this.add.sprite(100, 128, 'cardsDecks', 1);
      deckSprite.setInteractive();
      //deckSprite.setScale(0.5);

      // Draw the places cards can be placed again 500px lower
      for (let i = 0; i < centerPileX.length; i++) {
         deckBottom[i] = this.add.sprite(centerPileX[i], centerPileY - 180 + 400, 'cards' + suits[i], 0).setTint(0x408080);
         deckBottom[i].setDepth(0);
      }
      for (let i = 0; i < centerPileX.length; i++) {
         deckBottom[i + 4] = this.add.sprite(centerPileX[i], centerPileY + 400, 'deckBottomTexture');
      }
      deckBottom[8] = this.add.sprite(100, endPileY + 400, 'deckBottomTexture');
      deckBottom[8] = this.add.sprite(230, endPileY + 400, 'deckBottomTexture');
      deckBottom[8] = this.add.sprite(230, centerPileY + 400, 'deckBottomTexture');

      let deck2Sprite = this.add.sprite(100, 128 + 400, 'cardsDecks', 1);
      deck2Sprite.setInteractive();

      
      socket.emit('dealCards', userID);
      /*setTimeout(() => {
         renderCards(this);
      }, 500);*/


      socket.on('userJoined', (message) => {
         console.log(message);
      });

      
      socket.on('recievePiles', (userID, allPlayersCards) => {
         //console.log(userID);
         console.log(allPlayersCards);

         allPlayersCards.forEach(allCards => {
            let foundDeck = this.decks.find(aDeck => aDeck.deck.userID === allCards.deck.userID);
            //console.log(this.decks.find(theseCards => theseCards.deck.userID === userID));
            //console.log(allCards.deck.userID);
            if (!foundDeck) {
               let newDeck = this.createAllCards(allCards.deck.userID);
               this.decks.push(newDeck);
            }
         });
         console.log(this.decks);

         // get the data of all the players,
         allPlayersCards.forEach(allCards => {
            let foundDeck = this.decks.find(aDeck => aDeck.deck.userID === allCards.deck.userID);

            let centerPilesData = allCards.centerPiles;
            let endPilesData = allCards.endPiles;
            let drawPileData = allCards.drawPile;
            let demonPileData = allCards.demonPile;
            let deckPileData = allCards.deckPile;
            console.log(foundDeck);

            this.updatePiles(foundDeck, foundDeck.deck, centerPilesData, endPilesData, drawPileData, demonPileData, deckPileData);
         });

         this.decks.forEach(allCards => {
            //console.log(allCards.deck.userID);
            //let foundDeck = allPlayersCards.find(allCards => allCards.deck.userID === userID);
            //renderCards(this, allCards, allCards.deck.userID, centerPileX, centerPileY, endPileX, endPileY);
         });

      });

      

      // When any outbout event occurs, sets time since last update to 0
      socket.onAnyOutgoing(() => {
         this.timeSinceLastMove = 0;
      });

      // Functions happen on clicking on deck, should be converted to an event listener
      this.input.on('pointerdown', (_pointer) => {
         let allCards = this.decks.find(allCards => allCards.deck.userID === userID);
         console.log(this.decks);
         console.log(userID);
         // Dupe code on variable declarations, probably could be cleaned up to be nicer
         // These nested ifs look like trash, should be cleaned up soon
         var mouseX = this.input.mousePointer.x;
         var mouseY = this.input.mousePointer.y;
         if (mouseX >= 56 && mouseX <= 144 && mouseY >= 56 && mouseY <= 176) {
            let drawn = allCards.deck.drawCard(allCards.deckPile);
            if (drawn !== undefined) {
               allCards.drawPile.push(drawn);
               deckBottom[8].setVisible(false);
            } else {
               length = allCards.drawPile.length;
               for (let i = 0; i < length; i++) {
                  let card = allCards.drawPile.pop();
                  allCards.deckPile[i] = card;
                  //card.getAt(0).setVisible(false);
                  //card.getAt(0).setInteractive(false);
               }
            }
            this.sendPiles(allCards);
            renderCards(this, allCards, userID, centerPileX, centerPileY, endPileX, endPileY);
         }
      });

      this.input.on('drag', (_pointer, container, dragX, dragY) => {
         let allCards = this.decks.find(allCards => allCards.deck.userID === userID);

         container.setData({x: container.x, y: container.y});
         container.x = dragX;
         container.y = dragY;
         let pile = container.getData('pile')
         let containerIndex = pile.indexOf(container);
         if ( !(pile === allCards.drawPile || pile === allCards.demonPile)) {
            for (let i = 0; i < pile.length; i++) {
               let card = pile[i];
               if (card.getAt(2).value <= container.getAt(2).value) {
                  card.x = container.x;
                  card.y = container.y + (20 * (i - containerIndex));
                  card.depth = container.depth + i; // Dont need the 1 but changing it might break things
               }
            }
         }
      });
      
      this.input.on('dragstart', (_pointer, container) => {
         let allCards = this.decks.find(allCards => allCards.deck.userID === userID);
         this.canRender = false;

         console.log(container.getAt(2).name)

         if (container.getData('pile') === allCards.drawPile) {
            container.setDepth(60);
         } else {
            for (let i = 0; i < container.getData('pile').length; i++) {
               container.getData('pile')[i].setDepth(60 + i);
            }
         }
         // Save the original position at the start of the drag
         container.setData('originX', container.x);
         container.setData('originY', container.y);
         
     });

      // Gonna cut up a bunch of this logic later now that I understand how it works, the server
      //   will be doing a lot of the work here, or probably checking the work before allowing it to happen
      this.input.on('dragend', (_pointer, container) => {
         // Find your own allCards object in decks to use
         let allCards = this.decks.find(allCards => allCards.deck.userID === userID);
         console.log(allCards);

         this.canRender = true;

         var mouseX = this.input.mousePointer.x;
         var mouseY = this.input.mousePointer.y;
         //console.log('testing');
         for (let i = 0; i < centerPileX.length; i++) {
            // Y Position modifiers are for the height of the pile
            if (mouseX >= centerPileX[i] - 44 && mouseX <= centerPileX[i] + 44 &&
                  mouseY >= centerPileY + ((allCards.centerPiles[i].length - 1) * 20) - 62 && 
                  mouseY <= centerPileY + ((allCards.centerPiles[i].length - 1) * 20) + 62) {
               // console.log("CenterPile length: " + centerPiles[i].length)
               if (this.canAddToCenterPile(container, allCards.centerPiles[i][allCards.centerPiles[i].length - 1], allCards)) {
                  // Remove the card from its original pile
                  let originalPile = container.getData('pile');
                  let index = originalPile.indexOf(container);
                  if (index !== -1) {
                     let cardsToMove = originalPile.splice(index);
                     allCards.centerPiles[i].push(...cardsToMove);
                  }
                  //this.renderCards();
                  //console.log('testing');
                  break;
               }
               // Store a reference to the new pile in the card
               container.setData('pile', allCards.centerPiles[i]);
               break;
            } else if (mouseX >= endPileX[i] - 44 && mouseX <= endPileX[i] + 44 &&
               mouseY >= endPileY - 62 && mouseY <= endPileY + 62) {
               for (let i = 0; i < allCards.endPiles.length; i++) {
                  //console.log(this.canPlaceOnEndPile(container, endPiles[i], i));
                  if (this.canPlaceOnEndPile(container, allCards.endPiles[i], i)) {
                     for (let j = 0; j < allCards.endPiles[i].length + 1; j++) {
                        //console.log(this.canPlaceOnEndPile(container, endPiles[i], i));
                        // Remove the card from its original pile
                        let originalPile = container.getData('pile');
                        let index = originalPile.indexOf(container);
                        if (index !== -1) {
                              originalPile.splice(index, 1);
                        }
                        // Add the card to the end pile
                        allCards.endPiles[i].push(container);
      
                        // Store a reference to the new pile in the card
                        container.setData('pile', allCards.endPiles[i]);
                        break;
                     }
                  }
               }
            }
         }
         this.sendPiles(allCards);
         //updatePiles(deck, centerPilesData, endPilesData, drawPileData, demonPileData, deckPileData);

         renderCards(this, allCards, allCards.deck.userID, centerPileX, centerPileY, endPileX, endPileY);
      });
   }

   update() {
      var mouseX = this.input.mousePointer.x;
      var mouseY = this.input.mousePointer.y;
      mouseX = mouseX | 0;
      mouseY = mouseY | 0;
      this.mousePositionText.setText(`Mouse Position: (${mouseX}, ${mouseY})`);
      //this.demonPileCount.setText(`${demonPile.length}`);
      //this.deckPileCount.setText(`${deckPile.length}`);
      //this.renderCards();

      this.timeSinceLastMove++;
      if ((this.timeSinceLastMove % 300) === 0) { // Using 300 because higher tickrate is annoying, lower it later to 30
         socket.emit('returnPiles');  // Fetches gamestate from server after 6 seconds of inactivity
         console.log("Test");
         if (this.canRender === true) {
            //console.log(this.decks.length);
            this.decks.forEach(allCards => {
               console.log(allCards.deck.userID);
               renderCards(this, allCards, allCards.deck.userID, centerPileX, centerPileY, endPileX, endPileY);
           });
        }
      }
   }

   

   canPlaceOnEndPile(container, pile, pileIndex) {
      // Check if the suit of the card matches the suit of the pile
      let card = container.getAt(2);
      if (card.suit !== pileIndex) {
          return false;
      }

      // If the pile is empty, it can only accept a card with the lowest value
      if (pile.length === 0) {
          return card.value === 0;
      } else {
          // If the pile is not empty, it can only accept a card with a value
          // that is one greater than the value of the top card in the pile
          let topCard = pile[pile.length - 1].getAt(2);
          return card.value === topCard.value + 1;
      }
   }

   flipCard(container, faceUp) {
      let card = container.getAt(2);
      // Initialized cards need to be flipped differently than cards that are already in the game
      if (card.faceDownObject.visible === card.faceUpObject.visible) {
         card.faceUp = !faceUp;
         card.faceUpObject.visible = card.faceUp;
      } else {
         card.faceUp = !card.faceUp;
         card.faceUpObject.visible = faceUp;
         card.faceDownObject.visible = !faceUp;
      }
   }

   canAddToCenterPile(cardToAdd, bottomCard, allCards) {
      // Check if the value of the card to add is one less than the value of the bottom card
      let cardAdd = cardToAdd.getAt(2);
      if (cardAdd.value === 12 && bottomCard === undefined) {
         return true;
      //  Proceed if the card is from the demonPile and the bottom card is undefined
      } else if (bottomCard === undefined && cardToAdd.getData('pile') === allCards.demonPile) {
         //console.log("Card is from demonPile");
         return true;
      } else if (bottomCard === undefined) {
         return false;
      }
      
      let cardBottom = bottomCard.getAt(2);
      //console.log(cardBottom.value);
      if (cardAdd.value !== cardBottom.value - 1) {
         return false;
      }
  
      // Check if the suits are of opposite colors
      const redSuits = [suits.Hearts, suits.Diamonds];
      const blackSuits = [suits.Clubs, suits.Spades];
  
      if ((redSuits.includes(cardAdd.suit) && redSuits.includes(cardBottom.suit)) ||
           (blackSuits.includes(cardAdd.suit) && blackSuits.includes(cardBottom.suit))) {
         return false;
      }
  
      // If the card passed both checks, it can be added to the pile
      return true;
  }

   // Sends the users gamestate to the server
   sendPiles(allCards) {
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
            //pileData.pile = demonPile[0].getData('pile')
            
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
            //pileData.pile = demonPile[0].getData('pile')

            endPilesData[i][j] = pileData;
         }
      };

      for (let i = 0; i < allCards.drawPile.length; i++) {
         let pileData = {name : '', suit : 0, value : 0};
         pileData.name = allCards.drawPile[i].getAt(2).name;
         pileData.suit = allCards.drawPile[i].getAt(2).suit;
         pileData.value = allCards.drawPile[i].getAt(2).value;
         //pileData.pile = demonPile[0].getData('pile')

         drawPileData[i] = pileData;
      };

      for (let i = 0; i < allCards.demonPile.length; i++) {
         let pileData = {name : '', suit : 0, value : 0};
         pileData.name = allCards.demonPile[i].getAt(2).name;
         pileData.suit = allCards.demonPile[i].getAt(2).suit;
         pileData.value = allCards.demonPile[i].getAt(2).value;
         //pileData.pile = demonPile[0].getData('pile')

         demonPileData[i] = pileData;
      };

      for (let i = 0; i < allCards.deckPile.length; i++) {
         let pileData = {name : '', suit : 0, value : 0};
         pileData.name = allCards.deckPile[i].getAt(2).name;
         pileData.suit = allCards.deckPile[i].getAt(2).suit;
         pileData.value = allCards.deckPile[i].getAt(2).value;
         //pileData.pile = demonPile[0].getData('pile')

         deckPileData[i] = pileData;
      };

      socket.emit('sendPiles', centerPilesData, endPilesData, drawPileData, demonPileData, deckPileData);
      //console.log("Test2")
   }

   // Recieves the gamestate sent from the server and updates the client
   updatePiles(allCards, deck, centerPilesData, endPilesData, drawPileData, demonPileData, deckPileData) {
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
      if (this.canRender === true) {
         let playerID = allCards.deck.userID;
         renderCards(this, allCards, playerID, centerPileX, centerPileY, endPileX, endPileY);
      }
   }

   // Use to build objects that will store the cards for each player
   createAllCards(playerID) {
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
  
          deck: new Deck(this, playerID)
      }
  
      allCards.centerPiles = [allCards.centerPile1, allCards.centerPile2, allCards.centerPile3, allCards.centerPile4];
      allCards.endPiles = [allCards.endPile1, allCards.endPile2, allCards.endPile3, allCards.endPile4];
  
      return allCards;
  }

}

//const randomId = () => crypto.randomBytes(8).toString("hex");


const config = {
   type: Phaser.AUTO,
   scene: [PlaygroundScene],
   scale: {
      parent: 'game',
      width: 900,//1500,
      height: 900,//1023,
      mode: Phaser.Scale.NONE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
   },
   mipmapFilter: 'LINEAR_MIPMAP_NEAREST',
};

export default new Phaser.Game(config);
