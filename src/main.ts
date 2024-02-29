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
const endPileX = [420, 540, 660, 780];
const endPileY = 120;

let suits = card_config.Suits;
let values = card_config.Values;

let deckBottom: Phaser.GameObjects.Sprite[] = [];

// Create arrays to store the cards in each center pile
let centerPile1: Phaser.GameObjects.Container[] = [];
let centerPile2: Phaser.GameObjects.Container[] = [];
let centerPile3: Phaser.GameObjects.Container[] = [];
let centerPile4: Phaser.GameObjects.Container[] = [];

// Create arrays to store the cards in each center pile
let endPile1: Phaser.GameObjects.Container[] = [];
let endPile2: Phaser.GameObjects.Container[] = [];
let endPile3: Phaser.GameObjects.Container[] = [];
let endPile4: Phaser.GameObjects.Container[] = [];

// Create arrays to store the piles
const centerPiles = [centerPile1, centerPile2, centerPile3, centerPile4];
const endPiles = [endPile1, endPile2, endPile3, endPile4];
const drawPile: Phaser.GameObjects.Container[] = [];

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
         deckBottom[i].setDepth(1);
      }
      for (let i = 0; i < centerPileX.length; i++) {
         deckBottom[i + 4] = this.add.sprite(centerPileX[i], centerPileY, 'deckBottomTexture');
      }
      deckBottom[8] = this.add.sprite(230, centerPileY, 'deckBottomTexture');

      // Add the deck sprite
      this.add.sprite(100, 308, 'cardsDecks', 1);

      const deck = new Deck(this);
      //deck.Shuffle();

      // Deal 1 card to each pile and remove them from the deck
      centerPile1.push(deck.cards[0]);
      // deck.cards.pop();
      this.flipCard(centerPile1[0], centerPile1[0].getAt(2).faceUp);
      //console.log("This: " + centerPile1[0].getAt(2).faceUp);
      centerPile2.push(deck.cards[13]);
      // deck.cards.pop();
      this.flipCard(centerPile2[0], centerPile2[0].getAt(2).faceUp);
      centerPile3.push(deck.cards[1]);
      // deck.cards.pop();
      this.flipCard(centerPile3[0], centerPile3[0].getAt(2).faceUp);
      centerPile4.push(deck.cards[14]);
      // deck.cards.pop();
      this.flipCard(centerPile4[0], centerPile4[0].getAt(2).faceUp);

      let fakeContainer = this.add.container(0, 0);
      fakeContainer.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);

      // Add the fake container to each end pile
      for (let i = 0; i < endPiles.length; i++) {
         endPiles[i].push(fakeContainer);
      }

      this.renderCards();
      
      

      // Functions happen on clicking a card here, also happens on clicking other objects
      this.input.on('pointerdown', (_pointer: PointerEvent) => {
         let drawn = deck.drawCard();
         if (drawn !== undefined) {
            drawPile.push(drawn);
         }
         console.log(drawPile);
      });

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
         container.setDepth(2);
         for (let i = 0; i < centerPileX.length; i++) {
            if (container.x >= centerPileX[i] - 44 && container.x <= centerPileX[i] + 44 &&
                  container.y >= centerPileY - 62 && container.y <= centerPileY + 62) {
               // The card is within the bounds of the pile, so add it to the pile's array
               centerPiles[i].push(container);
               // Make the card stick to the pile
               container.x = centerPileX[i];
               container.y = centerPileY + 20 * (centerPiles[i].length - 1);
               // Remove the card from its original pile
               let originalPile = container.getData('pile') as Phaser.GameObjects.Container[];
               let index = originalPile.indexOf(container);
               if (index !== -1) {
                  originalPile.splice(index, 1);
               }
               // Store a reference to the new pile in the card
               container.setData('pile', centerPiles[i]);
               //console.log(container.getData('pile'));
               break;
            } else if ((container.x >= endPileX[i] - 44 || container.x <= endPileX[i] + 44 ||
               container.y >= endPileY - 62 || container.y <= endPileY + 62)) {
                  //console.log("Made it to endPiles checks")
               for (let i = 0; i < endPiles.length; i++) {
                  for (let j = 0; j < endPiles[i].length; j++) {
                     //console.log("Container bounds:", container.getBounds());
                     //console.log("Card bounds:", endPiles[i][j].getBounds());
                     if (this.canPlaceOnEndPile(container, endPiles[i], i)) {
                        // Remove the card from its original pile
                        //console.log(endPiles[i][j].getBounds());
                        let originalPile = container.getData('pile') as Phaser.GameObjects.Container[];
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
         //this.renderCards();
      }
   }

   // This is more like what I will want to do, the server should be checking if a card goes on a stack,
   //   and then sending back the new state of the game
   // Only check the player's board on drag end, otherwise it doesn't need to be updated.
   // Perhaps call this on an if() which works when the server sends back a new state of the game
   renderCards() {
      // Clear the current cards
      //this.children.removeAll();
      this.mousePositionText = this.add.text(10, 10, '', { color: '#ffffff' });

      // Draw the places cards can be placed
      for (let i = 0; i < centerPileX.length; i++) {
         deckBottom[i] = this.add.sprite(centerPileX[i], centerPileY - 180, 'cards' + suits[i], 0).setTint(0x408080);
      }
      for (let i = 0; i < centerPileX.length; i++) {
         deckBottom[i + 4] = this.add.sprite(centerPileX[i], centerPileY, 'deckBottomTexture');
         deckBottom[i + 4].setDepth(0);
      }
      deckBottom[8] = this.add.sprite(230, centerPileY, 'deckBottomTexture');
      deckBottom[8] = this.add.sprite(100, centerPileY, 'deckBottomTexture');

      // Add the deck sprite
      let deckSprite = this.add.sprite(100, 308, 'cardsDecks', 1);
      deckSprite.setInteractive();
      deckSprite.on('clicked', () => {
      });
      
      // Draw each card at its appropriate position for centerPiles
      for (let i = 0; i < centerPiles.length; i++) {
         for (let j = 0; j < centerPiles[i].length; j++) {
            let card = this.add.existing(centerPiles[i][j]);
            card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
            this.input.setDraggable(card);
            card.x = centerPileX[i];
            card.y = centerPileY + 20 * j;
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
            //card.setVisible(true);
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
         card.y = centerPileY;
         console.log(card.x, card.y);
         this.flipCard(card, card.getAt(2).faceUp);
         card.setDepth(i + 5);
         // Store a reference to the pile in the card
         card.setData('pile', drawPile);
      }
   }

   canPlaceOnEndPile(container: Phaser.GameObjects.Container, pile: Phaser.GameObjects.Container[], pileIndex: number): boolean {
      // Check if the suit of the card matches the suit of the pile
      let card = container.getAt(2) as Card;
      if (card.suit !== pileIndex) {
          return false;
      }

      // If the pile is empty, it can only accept a card with the lowest value
      if (pile.length === 1) {
          return card.value === 0;
      } else {
          // If the pile is not empty, it can only accept a card with a value
          // that is one greater than the value of the top card in the pile
          let topCard = pile[pile.length - 1].getAt(2) as Card;
          return card.value === topCard.value + 1;
      }
   }

   flipCard(container: Phaser.GameObjects.Container, faceUp: boolean) {
      let card = container.getAt(2) as Card;
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
