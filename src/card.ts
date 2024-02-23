import Phaser from 'phaser';

// This is a sprite because a raw gameObject can't render and breaks everything.
export default class Card extends Phaser.GameObjects.Sprite{
   name: string;
   suit: number;
   value: number;
   faceUp: boolean;

   faceUpObject: Phaser.GameObjects.Sprite;
   faceDownObject: Phaser.GameObjects.Sprite;
   container: Phaser.GameObjects.Container;

   constructor(scene: Phaser.Scene, name: string, suit: number, value: number, faceUp: boolean, faceUpObject: Phaser.GameObjects.Sprite, 
                  faceDownObject: Phaser.GameObjects.Sprite, container: Phaser.GameObjects.Container) 
   {
      super(scene, 0, 0, 'Card');
      this.name = name;
      this.suit = suit;
      this.value = value;
      this.faceUp = faceUp;
      this.faceUpObject = faceUpObject;
      this.faceDownObject = faceDownObject;
      this.container = container;
   }
}
