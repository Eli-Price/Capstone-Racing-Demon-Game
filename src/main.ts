import Phaser, { GameObjects, Textures } from 'phaser';
import Card from './card';
import { Deck } from './deck';
import { createDeckBottom, drawDeckBottom } from './deck_bottom';
import * as card_config from './card_config';
import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

// Positions of the centerPiles
const centerPileX = [420, 540, 660, 780];
const centerPileY = 300;

let suits = card_config.Suits;
let values = card_config.Values;

//const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
let deckBottom = [];

// Create arrays to store the cards in each center pile
let centerPile1: Card[] = [];
let centerPile2: Card[] = [];
let centerPile3: Card[] = [];
let centerPile4: Card[] = [];

// Create arrays to store the cards in each center pile
let endPile1: Card[] = [];
let endPile2: Card[] = [];
let endPile3: Card[] = [];
let endPile4: Card[] = [];

// Create arrays to store the piles
const centerPiles = [centerPile1, centerPile2, centerPile3, centerPile4];
const endPiles = [endPile1, endPile2, endPile3, endPile4];

class PlaygroundScene extends Phaser.Scene {
   private mousePositionText!: Phaser.GameObjects.Text;
   constructor() {
      super('playground');
      this.mousePositionText = {} as Phaser.GameObjects.Text;
   }

   preload() {
      this.load.spritesheet(
         'cardsSpades',
         './assets/Top-Down/Cards/Spades-88x124.png',
         { frameWidth: 88, frameHeight: 124 }
      );
      this.load.spritesheet(
         'cardsClubs',
         './assets/Top-Down/Cards/Clubs-88x124.png',
         { frameWidth: 88, frameHeight: 124 }
      );
      this.load.spritesheet(
         'cardsDiamonds',
         './assets/Top-Down/Cards/Diamonds-88x124.png',
         { frameWidth: 88, frameHeight: 124 }
      );
      this.load.spritesheet(
         'cardsHearts',
         './assets/Top-Down/Cards/Hearts-88x124.png',
         { frameWidth: 88, frameHeight: 124 }
      );
      this.load.spritesheet(
         'cardBacks',
         './assets/Top-Down/Cards/Card_Back-88x124.png',
         { frameWidth: 88, frameHeight: 124 }
      );
      this.load.spritesheet(
         'cardsDecks',
         './assets/Top-Down/Cards/Card_DeckA-88x140.png',
         { frameWidth: 88, frameHeight: 140 }
      );
   }

   create() {
      this.cameras.main.setBackgroundColor('#408080');
      createDeckBottom(this);

      // Draw the places cards can be placed
      for (let i = 0; i < centerPileX.length; i++) {
         deckBottom[i] = this.add.sprite(centerPileX[i], centerPileY - 180, 'cards' + suits[i], 0).setTint(0x408080);
      }
      for (let i = 0; i < centerPileX.length; i++) {
         deckBottom[i + 4] = this.add.sprite(centerPileX[i], centerPileY, 'deckBottomTexture');
      }
      deckBottom[8] = this.add.sprite(230, centerPileY, 'deckBottomTexture');

      // Add the deck sprite
      this.add.sprite(100, 308, 'cardsDecks', 1);

      const deck = new Deck(this);
      deck.Shuffle();
      console.log(this.children)

      // Deal 1 card to each pile and remove them from the deck
      centerPile1.push(deck.cards[51]);
      deck.cards.pop();
      centerPile2.push(deck.cards[50]);
      deck.cards.pop();
      centerPile3.push(deck.cards[49]);
      deck.cards.pop();
      centerPile4.push(deck.cards[48]);
      deck.cards.pop();

      this.renderCards();

      // Set the card as interactive and draggable, position it at the corresponding pile, and flip it face up
      // Probably move this to the Deal function later
      for (let i = 0; i < centerPiles.length; i++) {
         let card = this.add.existing(centerPiles[i][0].container);
         card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
         this.input.setDraggable(card);
         card.x = centerPileX[i];
         card.y = 300;
         deck.flipCard(centerPiles[i][0], true);
         // Store a reference to the pile in the card
         card.setData('pile', centerPiles[i]);
      }
      
      // Functions happen on clicking a card here, also happens on clicking other objects
      this.input.on('gameobjectdown', (_pointer: PointerEvent, container: Phaser.GameObjects.Container) => {
         container.setDepth(20);
         //console.log(gameObject.getAt(2).faceUp);  // It works, TypeScript is just being a pain
         let card = container.getAt(2) as Card;
         //deck.flipCard(card, !(card.faceUp));
      });
      console.log(this.children);

      this.input.on('drag', (_pointer: PointerEvent, container: Phaser.GameObjects.Container, 
                                dragX: number, dragY: number) => {
            container.setData({x: container.x, y: container.y});
            container.x = dragX;
            container.y = dragY;
         }
      );
      
      // These two are for moving the card back to its original position after dragging if a valid move isn't made
      this.input.on('dragstart', (_pointer: PointerEvent, container: Phaser.GameObjects.Container) => {
         // Save the original position at the start of the drag
         container.setDepth(20);
         container.setData('originX', container.x);
         container.setData('originY', container.y);
     });

      this.input.on('dragend', (_pointer: PointerEvent, container: Phaser.GameObjects.Container) => {
         // Move the container back to its original position when the drag ends
         container.setDepth(2);
         for (let i = 0; i < centerPileX.length; i++) {
            if (container.x >= centerPileX[i] - 44 && container.x <= centerPileX[i] + 44 &&
                  container.y >= centerPileY - 62 && container.y <= centerPileY + 62) {
               // The card is within the bounds of the pile, so add it to the pile's array
               centerPiles[i].push(container.getAt(2) as Card);
               // Make the card stick to the pile
               container.x = centerPileX[i];
               container.y = centerPileY + 20 * (centerPiles[i].length - 1);
               // Remove the card from its original pile
               let originalPile = container.getData('pile') as Card[];
               let index = originalPile.indexOf(container.getAt(2) as Card);
               if (index !== -1) {
                  originalPile.splice(index, 1);
               }
               // Store a reference to the new pile in the card
               container.setData('pile', centerPiles[i]);
               console.log(centerPiles[i]);
               break;
            } else if (!(container.x >= centerPileX[i] - 44 || container.x <= centerPileX[i] + 44 ||
               container.y >= centerPileY - 62 || container.y <= centerPileY + 62)) {
               // The card isn't within the bounds of the pile, so move it back to its original position
               container.x = container.getData('originX');
               container.y = container.getData('originY');
            }
         }
         this.renderCards();
      });
   }

   update() {
      var mouseX = this.input.mousePointer.x;
      var mouseY = this.input.mousePointer.y;
      mouseX = mouseX | 0;
      mouseY = mouseY | 0;
      this.mousePositionText.setText(`Mouse Position: (${mouseX}, ${mouseY})`);

      if (false) {
         this.renderCards();
      }
   }

   // This is more like what I will want to do, the server should be checking if a card goes on a stack,
   //   and then sending back the new state of the game
   // Only check the player's board on drag end, otherwise it doesn't need to be updated.
   // Perhaps call this on an if() which works when the server sends back a new state of the game
   renderCards() {
      // Clear the current cards
      this.children.removeAll();

      this.mousePositionText = this.add.text(10, 10, '', { color: '#ffffff' });

      // Draw the places cards can be placed
      for (let i = 0; i < centerPileX.length; i++) {
         deckBottom[i] = this.add.sprite(centerPileX[i], centerPileY - 180, 'cards' + suits[i], 0).setTint(0x408080);
      }
      for (let i = 0; i < centerPileX.length; i++) {
         deckBottom[i + 4] = this.add.sprite(centerPileX[i], centerPileY, 'deckBottomTexture');
      }
      deckBottom[8] = this.add.sprite(230, centerPileY, 'deckBottomTexture');

      // Add the deck sprite
      this.add.sprite(100, 308, 'cardsDecks', 1);
      

      // Add the deck sprite
      this.add.sprite(100, 310, 'cardsDecks', 1);
  
      // Draw each card at its appropriate position
      for (let i = 0; i < centerPiles.length; i++) {
         for (let j = 0; j < centerPiles[i].length; j++) {
            let card = this.add.existing(centerPiles[i][j].container);
            card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
            this.input.setDraggable(card);
            card.x = centerPileX[i];
            card.y = centerPileY + 20 * j;
            card.setDepth(j);
            // Store a reference to the pile in the card
            card.setData('pile', centerPiles[i]);
         }
      }
   }
}



const config: Phaser.Types.Core.GameConfig = {
   type: Phaser.AUTO,
   scene: [PlaygroundScene],
   scale: {
      parent: 'game',
      width: 960,
      height: 740,
      mode: Phaser.Scale.NONE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
   },
   mipmapFilter: 'LINEAR_MIPMAP_NEAREST',
};

export default new Phaser.Game(config);
