// import Phaser from 'phaser';

// This is a sprite because a raw gameObject can't render and breaks everything
export default class Card extends Phaser.GameObjects.Sprite{
   name;  // string
   suit;  // integer
   value; // integer
   faceUp; // boolean

   faceUpObject; // This is a sprite 
   faceDownObject; // This is a sprite
   container;  // This is a container 

   constructor(scene, name, suit, value, faceUp, faceUpObject, faceDownObject, container) 
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
