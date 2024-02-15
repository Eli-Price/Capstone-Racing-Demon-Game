import Phaser from 'phaser';
import * as CardConfig from './card_config';
import { Deck } from './deck';

let card;

class PlaygroundScene extends Phaser.Scene {
   constructor() {
      super('playground');
   }

   preload() {
      this.load.bitmapFont(
         CardConfig.Font.NAME,
         CardConfig.Font.IMAGE,
         CardConfig.Font.CONFIG
      );

      this.load.spritesheet(
         'cards',
         './assets/Top-Down/Cards/Spades-88x124.png',
         { frameWidth: 88, frameHeight: 124 }
      );
   }

   create() {
      const deck = new Deck(this);
      deck.Deal();

      card = this.add.sprite(88, 124, 'cards', 0);
   }

   update() {
      var mouseX = this.input.mousePointer.x;
      var mouseY = this.input.mousePointer.y;
      mouseX = mouseX | 0;
      mouseY = mouseY | 0;
      var positionText = `Mouse Position: (${mouseX}, ${mouseY})`;

      this.children.each((child) => {
         if (
            child instanceof Phaser.GameObjects.Text &&
            child.text.startsWith('Mouse Position')
         ) {
            child.destroy();
         }
      });

      this.add.text(10, 10, positionText, { color: '#ffffff' });
   }
}

const config: Phaser.Types.Core.GameConfig = {
   type: Phaser.AUTO,
   scene: [PlaygroundScene],
   scale: {
      parent: 'game',
      width: 960,
      height: 540,
      mode: Phaser.Scale.NONE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
   },
   mipmapFilter: 'LINEAR_MIPMAP_NEAREST',
};

export default new Phaser.Game(config);
