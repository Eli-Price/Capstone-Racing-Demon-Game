import Phaser from 'phaser';
import Card from './card';

export class Deck {
   public cards: Card[] = [];

   constructor(scene: Phaser.Scene) {
      const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
      for (let suit = 0; suit < suits.length; suit++) {
         for (let value = 0; value < 13; value++) {
            let card: Card = new Card(
               scene,
               suits[suit] + value,
               suit,
               value,
               false,
               new Phaser.GameObjects.Sprite(scene, 0, 0, 'cards' + suits[suit], value),
               new Phaser.GameObjects.Sprite(scene, 0, 0, 'cardBacks', 0),
               scene.add.container(0, 0)
            );
            this.cards.push(card);
            card.faceUpObject.setVisible(false);
            card.faceDownObject.setVisible(false);
            card.container.add([card.faceUpObject, card.faceDownObject, card]);
            card.container.getAt(2).setVisible(false); // It works, TypeScript is just being a pain
         }
      }
   }

   // Shuffle the cards using the Fisher-Yates algorithm
   public Shuffle() {
      for (let i = this.cards.length - 1; i > 0; --i) {
         const j = Math.floor(Math.random() * (i + 1));
         [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
      }
   }

   // Deals cards in a setup for racing demon
   public Deal = () => {
      this.Shuffle(); // Shuffle the cards
   };

   public drawCard() {
      return this.cards.pop();
   }

   public flipCard(card: Card, faceUp: boolean) {
      card.faceUp = !card.faceUp;
      card.faceUpObject.visible = faceUp;
      card.faceDownObject.visible = !faceUp;
   }
}
