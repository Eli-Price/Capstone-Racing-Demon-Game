import Phaser from 'phaser';

export default class Card {
   name: string;
   suit: number;
   value: number;
   faceUp: boolean;

   faceUpObject: Phaser.GameObjects.Sprite;
   faceDownObject: Phaser.GameObjects.Sprite;
   container: Phaser.GameObjects.Container;

   constructor(name: string, suit: number, value: number, faceUp: boolean, faceUpObject: Phaser.GameObjects.Sprite, 
                  faceDownObject: Phaser.GameObjects.Sprite, container: Phaser.GameObjects.Container) 
   {
      this.name = name;
      this.suit = suit;
      this.value = value;
      this.faceUp = faceUp;
      this.faceUpObject = faceUpObject;
      this.faceDownObject = faceDownObject;
      this.container = container;
   }
}
