import Phaser from 'phaser';

export default interface Card {
   suit: number;
   value: number;
   faceUp: boolean;

   gameObject: Phaser.GameObjects.Image;
}
