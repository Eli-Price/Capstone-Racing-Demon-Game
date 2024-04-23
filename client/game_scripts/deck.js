//import Phaser from 'phaser';
import Card from './card.js';

export class Deck {
   cards = [];
   userID = 0;

   constructor(scene, userID) {
      this.scene = scene;
      this.userID = userID;
      const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
      for (let suit = 0; suit < suits.length; suit++) {
         for (let value = 0; value < 13; value++) {
            let card = new Card(
               scene,
               suits[suit] + value,
               suit,
               value,
               true,
               new Phaser.GameObjects.Sprite(scene, 0, 0, 'cards' + suits[suit], value),
               new Phaser.GameObjects.Sprite(scene, 0, 0, 'cardBacks', 0),
               scene.add.container(0, 0)
            );
            card.faceUpObject.setVisible(false);
            card.faceDownObject.setVisible(false);
            card.container.add([card.faceUpObject, card.faceDownObject, card]);
            card.container.getAt(2).setVisible(false); 
            card.container.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);

            card.body = new Phaser.Physics.Arcade.Body(scene.physics.world, card.container);
            card.body.setCollideWorldBounds(true);

            this.cards.push(card.container);
         }
      }
   }

   // Shuffle the cards using the Fisher-Yates algorithm
   Shuffle() {
      for (let i = this.cards.length - 1; i > 0; --i) {
         const j = Math.floor(Math.random() * (i + 1));
         [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
      }
   }

   // Deals cards in a setup for racing demon
   Deal = (centerPiles, endPiles, demonPile, deckPile) => {
      this.Shuffle(); // Shuffle the cards

      this.cards.forEach(card => deckPile.push(card));
      
      // Deal 1 card to each pile and remove them from the deck
      for (let i = 0; i < 4; i++) {
         centerPiles[i].push(this.cards[deckPile.length - 1]);
         deckPile.pop();
      }

      // Deal 13 cards to the demon pile and remove them from the deck
      for (let i = 0; i < 13; i++) {
         demonPile.push(this.cards[deckPile.length - 1]);
         deckPile.pop();
      }

      /*let fakeContainer = this.scene.add.container(0, 0);
      fakeContainer.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);*/

      // Add the fake container to each end pile
      /*for (let i = 0; i < endPiles.length; i++) {
         endPiles[i].push(fakeContainer);
      }*/

   };

   drawCard(deckPile) {
      //let card = this.cards.pop();
      return deckPile.pop();
   }
}
