//import Phaser, { GameObjects, Textures } from './phaser';
import Card from './card.js';
//import crypto from 'crypto';
import { suits, values} from './card_config.js';
import { Deck } from './deck.js';
import { createDeckBottom } from './deck_bottom.js';
/*import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';*/


const roomId = localStorage.getItem('roomId');
console.log(roomId);

const socket = io({
   auth: { 
      userID: localStorage.getItem('userID'),
      roomID: localStorage.getItem('roomID')
   }
});

socket.on('connect', () => {
   let userID = localStorage.getItem('userID');

   if (!userID) {
      userID = socket.id;
      localStorage.setItem('userID', userID);
   }

   socket.emit('userID', userID);
});


socket.emit('joinRoom', message => {
   console.log(message);
});

// Positions of the centerPiles
const centerPileX = [420, 540, 660, 780];
const centerPileY = 300;
const endPileX = [420, 540, 660, 780];
const endPileY = 120;

let deckBottom = [];

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

class PlaygroundScene extends Phaser.Scene {
   constructor() {
      super('playground');
      this.mousePositionText = null;
      this.demonPileCount = null;
      this.deckPileCount = null;
      this.deck = null;
      this.gameTimer = 0;
      this.timeSinceLastMove = 0;
      this.canRender = true;
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
         deckBottom[i] = this.add.sprite(centerPileX[i], centerPileY - 180, 'cards' + suits[i], 0).setTint(0x408080);
         deckBottom[i].setDepth(0);
      }
      for (let i = 0; i < centerPileX.length; i++) {
         deckBottom[i + 4] = this.add.sprite(centerPileX[i], centerPileY, 'deckBottomTexture');
      }
      deckBottom[8] = this.add.sprite(100, endPileY, 'deckBottomTexture');
      deckBottom[8] = this.add.sprite(230, endPileY, 'deckBottomTexture');
      deckBottom[8] = this.add.sprite(230, centerPileY, 'deckBottomTexture');

      let deckSprite = this.add.sprite(100, 128, 'cardsDecks', 1);
      deckSprite.setInteractive();

      

      this.deck = new Deck(this);
      
      socket.on('recievePiles', (centerPilesData, endPilesData, drawPileData, demonPileData, deckPileData) => {
         //console.log("Test1")
         //console.log("Server:" + centerPilesData)
         
         this.updatePiles(this.deck, centerPilesData, endPilesData, drawPileData, demonPileData, deckPileData);
         //console.log("Client: " + centerPiles);
      });

      

      // When any outbout event occurs, sets time since last update to 0
      socket.onAnyOutgoing(() => {
         this.timeSinceLastMove = 0;
      });
      
      socket.emit('dealCards');
      
      setTimeout(() => {
         this.renderCards();
      }, 500);

      // Functions happen on clicking on deck, should be converted to an event listener
      this.input.on('pointerdown', (_pointer) => {
         // Dupe code on variable declarations, probably could be cleaned up to be nicer
         // These nested ifs look like trash, should be cleaned up soon
         var mouseX = this.input.mousePointer.x;
         var mouseY = this.input.mousePointer.y;
         if (mouseX >= 56 && mouseX <= 144 && mouseY >= 56 && mouseY <= 176) {
            let drawn = this.deck.drawCard(deckPile);
            if (drawn !== undefined) {
               drawPile.push(drawn);
               deckBottom[8].setVisible(false);
            } else {
               length = drawPile.length;
               for (let i = 0; i < length; i++) {
                  let card = drawPile.pop();
                  deckPile[i] = card;
                  //card.getAt(0).setVisible(false);
                  //card.getAt(0).setInteractive(false);
               }
            }
            this.sendPiles();
            this.renderCards();
         }
      });

      this.input.on('drag', (_pointer, container, dragX, dragY) => {
            container.setData({x: container.x, y: container.y});
            container.x = dragX;
            container.y = dragY;
            let pile = container.getData('pile')
            let containerIndex = pile.indexOf(container);
            if ( !(pile === drawPile || pile === demonPile)) {
               for (let i = 0; i < pile.length; i++) {
                  let card = pile[i];
                  if (card.getAt(2).value <= container.getAt(2).value) {
                     card.x = container.x;
                     card.y = container.y + (20 * (i - containerIndex));
                     card.depth = container.depth + i; // Dont need the 1 but changing it might break things
                  }
               }
            }
         }
      );
      
      this.input.on('dragstart', (_pointer, container) => {
         this.canRender = false;

         console.log(container.getAt(2).name)

         if (container.getData('pile') === drawPile) {
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
         this.canRender = true;

         var mouseX = this.input.mousePointer.x;
         var mouseY = this.input.mousePointer.y;
         //console.log('testing');
         for (let i = 0; i < centerPileX.length; i++) {
            // Y Position modifiers are for the height of the pile
            if (mouseX >= centerPileX[i] - 44 && mouseX <= centerPileX[i] + 44 &&
                  mouseY >= centerPileY + ((centerPiles[i].length - 1) * 20) - 62 && 
                  mouseY <= centerPileY + ((centerPiles[i].length - 1) * 20) + 62) {
               // console.log("CenterPile length: " + centerPiles[i].length)
               if (this.canAddToCenterPile(container, centerPiles[i][centerPiles[i].length - 1])) {
                  // Remove the card from its original pile
                  let originalPile = container.getData('pile');
                  let index = originalPile.indexOf(container);
                  if (index !== -1) {
                     let cardsToMove = originalPile.splice(index);
                     centerPiles[i].push(...cardsToMove);
                  }
                  this.renderCards();
                  //console.log('testing');
                  break;
               }
               // Store a reference to the new pile in the card
               container.setData('pile', centerPiles[i]);
               break;
            } else if (mouseX >= endPileX[i] - 44 && mouseX <= endPileX[i] + 44 &&
               mouseY >= endPileY - 62 && mouseY <= endPileY + 62) {
               for (let i = 0; i < endPiles.length; i++) {
                  //console.log(this.canPlaceOnEndPile(container, endPiles[i], i));
                  if (this.canPlaceOnEndPile(container, endPiles[i], i)) {
                     for (let j = 0; j < endPiles[i].length + 1; j++) {
                        //console.log(this.canPlaceOnEndPile(container, endPiles[i], i));
                        // Remove the card from its original pile
                        let originalPile = container.getData('pile');
                        let index = originalPile.indexOf(container);
                        if (index !== -1) {
                              originalPile.splice(index, 1);
                        }
                        // Add the card to the end pile
                        endPiles[i].push(container);
      
                        // Store a reference to the new pile in the card
                        container.setData('pile', endPiles[i]);
                        break;
                     }
                  }
               }
            }
         }
         this.sendPiles();
         //updatePiles(deck, centerPilesData, endPilesData, drawPileData, demonPileData, deckPileData);

         this.renderCards();
      });
   }

   update() {
      var mouseX = this.input.mousePointer.x;
      var mouseY = this.input.mousePointer.y;
      mouseX = mouseX | 0;
      mouseY = mouseY | 0;
      this.mousePositionText.setText(`Mouse Position: (${mouseX}, ${mouseY})`);
      this.demonPileCount.setText(`${demonPile.length}`);
      this.deckPileCount.setText(`${deckPile.length}`);
      //this.renderCards();


      /*this.gameTimer++;
      if ((this.gameTimer % 180) === 0) {
         console.log("count: " + this.gameTimer);
         console.log("count2: " + this.timeSinceLastMove);
         this.sendPiles();  // Sends gamestate to server and also returns it to the client every 3 seconds
         setTimeout(() => {
            console.log("Timeout working");
            this.renderCards();
         }, 250);
      }*/

      this.timeSinceLastMove++;
      if ((this.timeSinceLastMove % 300) === 0) { // Using 300 because higher tickrate is annoying, lower it later to 30
         socket.emit('returnPiles');  // Fetches gamestate from server after 6 seconds of inactivity
         //console.log("Test");
         if (this.canRender === true) {
            this.renderCards();
        }
      }
   }

   // This is more like what I will want to do, the server should be checking if a card goes on a stack,
   //   and then sending back the new state of the game
   // Only check the player's board on drag end, otherwise it doesn't need to be updated.
   // Perhaps call this on an if() which works when the server sends back a new state of the game
   // Or its just a socket.on for when the board state updates, but then ther probably needs to be more than one
   //    function to update the board unless I want to waste a ton of effort
   renderCards() {
      // Add the deck sprite
      //console.log(this.children);

      // Clears any cards that shouldn't be visible in the drawPile
      this.deck.cards.forEach(card => {
         //console.log(card.getAt(0));
         if (deckPile.includes(card)) {
            this.children.remove(card);
            //card.getAt(0).setVisible(false);
            //card.setInteractive(false);
         }
     });
      
      
      // Draw each card at its appropriate position for centerPiles
      for (let i = 0; i < centerPiles.length; i++) {
         for (let j = 0; j < centerPiles[i].length; j++) {
            let card = centerPiles[i][j];
            //let card = this.add.existing(centerPiles[i][j]);
            //card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
            card.setInteractive(true);
            this.input.setDraggable(card);
            card.x = centerPileX[i];
            card.y = centerPileY + 20 * j;
            card.getAt(0).setVisible(true);
            card.setDepth(j);
            card.setData('pile', centerPiles[i]);
         }
      }
      // Draw each card at its appropriate position for endPiles
      for (let i = 0; i < endPiles.length; i++) {
         if (endPiles[i].length > 0) {
            let j = endPiles[i].length - 1; // Get the last card in the pile
            //let card = this.add.existing(endPiles[i][j]);
            let card = endPiles[i][j];
            //card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
            card.setInteractive(true);
            this.input.setDraggable(card);
            card.x = endPileX[i];
            card.y = endPileY;
            if (card.getAt(0)){
               card.getAt(0).setVisible(true);
            }
            card.setDepth(j);
            card.setData('pile', endPiles[i]);
         }
      }
      // Draw each card at its appropriate position for drawPile
      for (let i = 0; i < drawPile.length; i++) {
         let card = this.add.existing(drawPile[i]);
         //let card = drawPile[i];
         card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
         card.setInteractive(true);
         this.input.setDraggable(card);
         card.x = 230;
         card.y = endPileY;
         // Set faceup sprite to visible
         card.getAt(0).setVisible(true);
         card.setDepth(i + 5);
         card.setData('pile', drawPile);
      }
      // Draw each card at its appropriate position for demonPile
      for (let i = 0; i < demonPile.length; i++) {
         let card = this.add.existing(demonPile[i]);
         //card = demonPile[i];
         //card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
         card.setInteractive(true);
         this.input.setDraggable(card);
         card.x = 230;
         card.y = centerPileY;
         card.getAt(0).setVisible(true);
         card.setDepth(i + 5);
         // Store a reference to the pile in the card
         card.setData('pile', demonPile);
      }

      // Need to make gamescene for the other players, or do this on containers of gameobjects
      /*if (true) {
         this.cameras.main.rotation += 4 * 3.1415926/2;
      }*/
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

   canAddToCenterPile(cardToAdd, bottomCard) {
      // Check if the value of the card to add is one less than the value of the bottom card
      let cardAdd = cardToAdd.getAt(2);
      if (cardAdd.value === 12 && bottomCard === undefined) {
         return true;
      //  Proceed if the card is from the demonPile and the bottom card is undefined
      } else if (bottomCard === undefined && cardToAdd.getData('pile') === demonPile) {
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
   sendPiles() {
      let centerPilesData = [[],[],[],[]];
      let endPilesData = [[],[],[],[]];
      let drawPileData = [];
      let demonPileData = [];
      let deckPileData = [];

      /*let pileData = {
         name : '',
         suit : 0,
         value : 0
         //pile: demonPile[0].getData('pile')
      };*/

      for (let i = 0; i < centerPiles.length; i++) {
         for (let j = 0; j < centerPiles[i].length; j++) {
            let pileData = {name : '', suit : 0, value : 0};
            pileData.name = centerPiles[i][j].getAt(2).name;
            pileData.suit = centerPiles[i][j].getAt(2).suit;
            pileData.value = centerPiles[i][j].getAt(2).value;
            //pileData.pile = demonPile[0].getData('pile')
            
            centerPilesData[i][j] = pileData;
            //console.log(centerPilesData[i][j]);
         }
      };

      // Plus 1s because there are fake continers in the endpiles for the transparent sprites that go on the bottom.
      for (let i = 0; i < endPiles.length; i++) {
         for (let j = 0; j < endPiles[i].length; j++) {
            let pileData = {name : '', suit : 0, value : 0};
            pileData.name = endPiles[i][j].getAt(2).name;
            pileData.suit = endPiles[i][j].getAt(2).suit;
            pileData.value = endPiles[i][j].getAt(2).value;
            //pileData.pile = demonPile[0].getData('pile')

            endPilesData[i][j] = pileData;
         }
      };

      for (let i = 0; i < drawPile.length; i++) {
         let pileData = {name : '', suit : 0, value : 0};
         pileData.name = drawPile[i].getAt(2).name;
         pileData.suit = drawPile[i].getAt(2).suit;
         pileData.value = drawPile[i].getAt(2).value;
         //pileData.pile = demonPile[0].getData('pile')

         drawPileData[i] = pileData;
      };

      for (let i = 0; i < demonPile.length; i++) {
         let pileData = {name : '', suit : 0, value : 0};
         pileData.name = demonPile[i].getAt(2).name;
         pileData.suit = demonPile[i].getAt(2).suit;
         pileData.value = demonPile[i].getAt(2).value;
         //pileData.pile = demonPile[0].getData('pile')

         demonPileData[i] = pileData;
      };

      for (let i = 0; i < deckPile.length; i++) {
         let pileData = {name : '', suit : 0, value : 0};
         pileData.name = deckPile[i].getAt(2).name;
         pileData.suit = deckPile[i].getAt(2).suit;
         pileData.value = deckPile[i].getAt(2).value;
         //pileData.pile = demonPile[0].getData('pile')

         deckPileData[i] = pileData;
      };

      socket.emit('sendPiles', centerPilesData, endPilesData, drawPileData, demonPileData, deckPileData);
      //console.log("Test2")
   }

   // Recieves the gamestate sent from the server and updates the client
   async updatePiles(deck, centerPilesData, endPilesData, drawPileData, demonPileData, deckPileData) {
      
      // This is starting to reach functionality

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

      //console.log(centerPilesData);

      for (let i = 0; i < centerPilesData.length; i++) {
         for (let j = 0; j < centerPilesData[i].length; j++) {
            centerPiles[i].push(deck.cards.find(card => card.getAt(2).name === centerPilesData[i][j].name));
         }
      }
      for (let i = 0; i < endPilesData.length; i++) {
         for (let j = 0; j < endPilesData[i].length; j++) {
            endPiles[i].push(deck.cards.find(card => card.getAt(2).name === endPilesData[i][j].name));
         }
      }
      for (let i = 0; i < drawPileData.length; i++) {
         drawPile.push(deck.cards.find(card => card.getAt(2).name === drawPileData[i].name));
      }
      for (let i = 0; i < demonPileData.length; i++) {
         demonPile.push(deck.cards.find(card => card.getAt(2).name === demonPileData[i].name));
      }
      for (let i = 0; i < deckPileData.length; i++) {
         deckPile.push(deck.cards.find(card => card.getAt(2).name === deckPileData[i].name));
      }

      //console.log('updating');
      if (this.canRender === true) {
         this.renderCards();
      }
      //this.renderCards();
   }


}

//const randomId = () => crypto.randomBytes(8).toString("hex");


const config = {
   type: Phaser.AUTO,
   scene: [PlaygroundScene],
   scale: {
      parent: 'game',
      width: 900,//1500,
      height: 700,//1023,
      mode: Phaser.Scale.NONE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
   },
   mipmapFilter: 'LINEAR_MIPMAP_NEAREST',
};

export default new Phaser.Game(config);
