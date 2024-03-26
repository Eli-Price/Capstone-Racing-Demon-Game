//import Phaser, { GameObjects, Textures } from './phaser';
import Card from './card.js';
import { Deck } from './deck.js';
import { createDeckBottom, drawDeckBottom } from './deck_bottom.js';
/*import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';*/

const socket = io();

const roomId = localStorage.getItem('roomId');
socket.emit('joinRoom', roomId);

// Positions of the centerPiles
const centerPileX = [420, 540, 660, 780];
const centerPileY = 300;
const endPileX = [420, 540, 660, 780];
const endPileY = 120;

//let suits = card_config.Suits;
//let values = card_config.Values;

// These enums are a gross hack, if they stay they go to another file
//NON CONST enum for reverse mapping
const suits = (() => {
   const _enum = {
      Hearts: 0,
      Diamonds: 1,
      Clubs: 2,
      Spades: 3,
   };

   const _reverseEnum = {};
   for (const key in _enum) {
      _reverseEnum[_enum[key]] = key;
   }
   return Object.freeze(Object.assign({}, _enum, _reverseEnum));
})();

//NON CONST enum for reverse mapping
const values = (() => {
   const _enum = {
      Ace: 0,
      Two: 1,
      Three: 2,
      Four: 3,
      Five: 4,
      Six: 5,
      Seven: 6,
      Eight: 7,
      Nine: 8,
      Ten: 9,
      Jack: 10,
      Queen: 11,
      King: 12,
   };

   const _reverseEnum = {};
   for (const key in _enum) {
      _reverseEnum[_enum[key]] = key;
   }
   return Object.freeze(Object.assign({}, _enum, _reverseEnum));
})();

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

      // Draw the places cards can be placed
      for (let i = 0; i < centerPileX.length; i++) {
         deckBottom[i] = this.add.sprite(centerPileX[i], centerPileY - 180, 'cards' + suits[i], 0).setTint(0x408080);
         deckBottom[i].setDepth(1);
      }
      for (let i = 0; i < centerPileX.length; i++) {
         deckBottom[i + 4] = this.add.sprite(centerPileX[i], centerPileY, 'deckBottomTexture');
      }
      deckBottom[8] = this.add.sprite(230, centerPileY, 'deckBottomTexture');

      const deck = new Deck(this);
      deck.Deal(centerPiles, endPiles, demonPile, deckPile);

      this.renderCards();



      // Functions happen on clicking on deck, should be converted to an event listener
      this.input.on('pointerdown', (_pointer) => {
         // Dupe code on variable declarations, probably could be cleaned up to be nicer
         // These nested ifs look like trash, should be cleaned up soon
         var mouseX = this.input.mousePointer.x;
         var mouseY = this.input.mousePointer.y;
         //console.log("Mouse Pos: " + mouseX, mouseY);
         if (mouseX >= 56 && mouseX <= 144 && mouseY >= 56 && mouseY <= 176) {
            let drawn = deck.drawCard(deckPile);
            if (drawn !== undefined) {
               drawPile.push(drawn);
               deckBottom[8].setVisible(false);
            } else {
               length = drawPile.length;
               for (let i = 0; i < length; i++) {
                  let card = drawPile.pop();
                  deckPile[i] = card;  // This error doesn't break anything, an undefined cannot reach this point
               }
            }
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
         // Save the original position at the start of the drag
         if (container.getData('pile') === drawPile) {
            container.setDepth(60);
         } else {
            for (let i = 0; i < container.getData('pile').length; i++) {
               container.getData('pile')[i].setDepth(60 + i);
            }
         }
         container.setData('originX', container.x);
         container.setData('originY', container.y);
     });

      // Gonna cut up a bunch of this logic later now that I understand how it works, the server
      //   will be doing a lot of the work here, or probably checking the work before allowing it to happen
      this.input.on('dragend', (_pointer, container) => {
         for (let i = 0; i < centerPileX.length; i++) {
            if (container.x >= centerPileX[i] - 44 && container.x <= centerPileX[i] + 44 &&
                  container.y >= centerPileY + ((centerPiles[i].length - 1) * 20) - 62 && 
                  container.y <= centerPileY + ((centerPiles[i].length - 1) * 20) + 62) {
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
                  break;
               }
               // Store a reference to the new pile in the card
               container.setData('pile', centerPiles[i]);
               break;
            } else if ((container.x >= endPileX[i] - 44 || container.x <= endPileX[i] + 44 ||
               container.y >= endPileY - 62 || container.y <= endPileY + 62)) {
               for (let i = 0; i < endPiles.length; i++) {
                  for (let j = 0; j < endPiles[i].length; j++) {
                     if (this.canPlaceOnEndPile(container, endPiles[i], i)) {
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

         let centerPilesData = [];
         let endPilesData = [];
         let drawPileData = [];
         let demonPileData = [];
         let deckPileData = [];

         for (let i = 0; i < demonPile.length; i++) {
            let pileData = {
               name : '',
               suit : 0,
               value : 0,
               //pile: demonPile[0].getData('pile')
            };

            pileData.name = demonPile[i].getAt(2).name;
            pileData.suit = demonPile[i].getAt(2).suit;
            pileData.value = demonPile[i].getAt(2).value;
            //pileData.pile = demonPile[0].getData('pile')

            demonPileData[i] = pileData;
            
         };
         
         // Serialize the data with JSON.stringify
         //let superSerial = JSON.stringify(serializedData);
         //console.log(serializedData);  //Does it send the same data it recieves?
         socket.emit('sendPiles', demonPileData);

         socket.on('recievePiles', (demonPileData) => {
            // This is the starting to reach functionality
            console.log(demonPileData);  //Does it recieve the same data that was sent?
            //let data = JSON.parse(serializedData);
            //console.log(deck.cards[0].getAt(2).name);
            console.log(demonPileData[0].name);

            

            /*for (let card of deck.cards) {
               if (card.getAt(2).name === serializedData[0].name) {
                  demonPile.push(card);
               }
            };*/

            /*for (let i = 0; i < centerPiles.length; i++) {
               for (let j = 0; j < centerPiles[i].length; j++) {
                  centerPiles[i][j].name 
            }*/

            // Clear the existing arrays
            /*centerPiles.length = 0;
            endPiles.length = 0;
            //Pile.length = 0;*/
            demonPile.length = 0;
            //deckPile.length = 0;
            for (let i = 0; i < demonPileData.length; i++) {
               demonPile.push(deck.cards.find(card => card.getAt(2).name === demonPileData[i].name));
               //demonPile.push(temp);
            }

            // Push the new data into the existing arrays
            /*Array.prototype.push.apply(centerPiles, newCenterPiles);
            Array.prototype.push.apply(endPiles, newEndPiles);
            Array.prototype.push.apply(drawPile, newDrawPile);
            Array.prototype.push.apply(demonPile, newDemonPile);
            Array.prototype.push.apply(deckPile, newDeckPile);*/
            /*if (Array.isArray(newCenterPiles)) {
               Array.prototype.push.apply(centerPiles, newCenterPiles);
            }
            if (Array.isArray(newEndPiles)) {
               
               Array.prototype.push.apply(endPiles, newEndPiles);
            }
            if (Array.isArray(newDrawPile)) {
               Array.prototype.push.apply(drawPile, newDrawPile);
            }
            if (Array.isArray(newDemonPile)) {
               Array.prototype.push.apply(demonPile, newDemonPile);
            }
            if (Array.isArray(newDeckPile)) {
               Array.prototype.push.apply(deckPile, newDeckPile);
            }*/

            console.log('updating');
            this.renderCards();
         });
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
      //this.deckCount.setText(`${deck.cards.length}`);
   }

   // This is more like what I will want to do, the server should be checking if a card goes on a stack,
   //   and then sending back the new state of the game
   // Only check the player's board on drag end, otherwise it doesn't need to be updated.
   // Perhaps call this on an if() which works when the server sends back a new state of the game
   renderCards() {
      // Clear the current cards
      this.children.removeAll();
      this.mousePositionText = this.add.text(10, 10, '', { color: '#ffffff' });
      this.demonPileCount = this.add.text(221, 216, '', { color: '#ffffff' });
      //this.deckCount = this.add.text(95, 38, '', { color: '#ffffff' });

      // Draw the places cards can be placed
      for (let i = 0; i < centerPileX.length; i++) {
         deckBottom[i] = this.add.sprite(centerPileX[i], centerPileY - 180, 'cards' + suits[i], 0).setTint(0x408080);
      }
      for (let i = 0; i < centerPileX.length; i++) {
         deckBottom[i + 4] = this.add.sprite(centerPileX[i], centerPileY, 'deckBottomTexture');
         deckBottom[i + 4].setDepth(0);
      }
      /*if (deck.length > 0) {
         
      }*/
      deckBottom[8] = this.add.sprite(100, endPileY, 'deckBottomTexture');
      deckBottom[8] = this.add.sprite(230, endPileY, 'deckBottomTexture');
      deckBottom[8] = this.add.sprite(230, centerPileY, 'deckBottomTexture');
      

      // Add the deck sprite
      let deckSprite = this.add.sprite(100, 128, 'cardsDecks', 1);
      deckSprite.setInteractive();
      
      // Draw each card at its appropriate position for centerPiles
      for (let i = 0; i < centerPiles.length; i++) {
         for (let j = 0; j < centerPiles[i].length; j++) {
            let card = this.add.existing(centerPiles[i][j]);
            card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
            this.input.setDraggable(card);
            card.x = centerPileX[i];
            card.y = centerPileY + 20 * j;
            card.getAt(0).setVisible(true);
            card.setDepth(j);
            // Store a reference to the pile in the card
            card.setData('pile', centerPiles[i]);
         }
      }
      // Draw each card at its appropriate position for endPiles
      for (let i = 0; i < endPiles.length; i++) {
         if (endPiles[i].length > 0) {
            let j = endPiles[i].length - 1; // Get the last card in the pile
            let card = this.add.existing(endPiles[i][j]);
            card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
            //this.input.setDraggable(card);
            card.x = endPileX[i];
            card.y = endPileY;
            if (card.getAt(0)){
               card.getAt(0).setVisible(true);
            }
            card.setDepth(j);
            // Store a reference to the pile in the card
            card.setData('pile', endPiles[i]);
         }
      }
      // Draw each card at its appropriate position for drawPile
      for (let i = 0; i < drawPile.length; i++) {
         let card = this.add.existing(drawPile[i]);
         card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
         this.input.setDraggable(card);
         card.x = 230;
         card.y = endPileY;
         // Set faceup sprite to visible
         card.getAt(0).setVisible(true);
         //this.flipCard(card, card.getAt(2).faceUp);
         card.setDepth(i + 5);
         // Store a reference to the pile in the card
         card.setData('pile', drawPile);
      }
      // Draw each card at its appropriate position for demonPile
      for (let i = 0; i < demonPile.length; i++) {
         let card = this.add.existing(demonPile[i]);
         card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
         this.input.setDraggable(card);
         card.x = 230;
         card.y = centerPileY;
         // Set faceup sprite to visible
         card.getAt(0).setVisible(true);
         //this.flipCard(card, card.getAt(2).faceUp);
         card.setDepth(i + 5);
         // Store a reference to the pile in the card
         card.setData('pile', demonPile);
      }

      // Need to make gamescene for the other players, or do this on containers of gameobjects
      if (true) {
         this.cameras.main.rotation += 4 * 3.1415926/2;
      }
   }

   canPlaceOnEndPile(container, pile, pileIndex) {
      // Check if the suit of the card matches the suit of the pile
      let card = container.getAt(2);
      if (card.suit !== pileIndex) {
          return false;
      }

      // If the pile is empty, it can only accept a card with the lowest value
      if (pile.length === 1) {
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
         console.log("Card is from demonPile");
         return true;
      } else if (bottomCard === undefined) {
         return false;
      }
      
      let cardBottom = bottomCard.getAt(2);
      console.log(cardBottom.value);
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
}



const config = {
   type: Phaser.AUTO,
   scene: [PlaygroundScene],
   scale: {
      parent: 'game',
      width: 1500,
      height: 1023,
      mode: Phaser.Scale.NONE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
   },
   mipmapFilter: 'LINEAR_MIPMAP_NEAREST',
};

export default new Phaser.Game(config);
