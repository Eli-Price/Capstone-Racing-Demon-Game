import Phaser, { GameObjects } from 'phaser';
import Card from './card';
import { Deck } from './deck';

//let card: Phaser.GameObjects.Sprite;
//let cardS0: Card;

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
      const deck = new Deck(this);
      deck.Shuffle();

      // Deck testing code
      console.log(deck.cards);
      let card17 = this.add.existing(deck.cards[17].container);
      card17.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
      this.input.setDraggable(card17);
      card17.x = 88;
      card17.y = 224;

      this.cameras.main.setBackgroundColor('#408080');

      let card12 = this.add.existing(deck.cards[12].container);
      
      /*console.log(card12.getAt(2));
      let card = card12.getAt(2);
      console.log(card.faceUp);*/
      //deck.flipCard(deck.cards[12], true);
      card12.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
      this.input.setDraggable(card12);
      card12.x = 248;
      card12.y = 224;

      this.input.on('gameobjectdown', (_pointer: PointerEvent, container: Phaser.GameObjects.Container) => {
         //console.log(gameObject);
         //console.log(gameObject.getAt(2).faceUp);  // It works, TypeScript is just being a pain
         let card = container.getAt(2) as Card;
         deck.flipCard(card, !(card.faceUp));
      });


      this.mousePositionText = this.add.text(10, 10, '', { color: '#ffffff' });

      this.input.on('dragstart', (_pointer: PointerEvent, container: Phaser.GameObjects.Container) => {
         // Save the original position at the start of the drag
         container.setData('originX', container.x);
         container.setData('originY', container.y);
     });

      this.input.on('drag', (_pointer: PointerEvent, container: Phaser.GameObjects.Container, 
                                dragX: number, dragY: number) => {
            container.setData({x: container.x, y: container.y});
            container.x = dragX;
            container.y = dragY;
         }
      );

      this.input.on('dragend', (_pointer: PointerEvent, container: Phaser.GameObjects.Container) => {
         // Move the container back to its original position when the drag ends
         container.x = container.getData('originX');
         container.y = container.getData('originY');
     });
   }

   update() {
      var mouseX = this.input.mousePointer.x;
      var mouseY = this.input.mousePointer.y;
      mouseX = mouseX | 0;
      mouseY = mouseY | 0;
      this.mousePositionText.setText(`Mouse Position: (${mouseX}, ${mouseY})`);
   }
}

const config: Phaser.Types.Core.GameConfig = {
   type: Phaser.AUTO,
   scene: [PlaygroundScene],
   scale: {
      parent: 'game',
      width: 960,
      height: 640,
      mode: Phaser.Scale.NONE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
   },
   mipmapFilter: 'LINEAR_MIPMAP_NEAREST',
};

export default new Phaser.Game(config);
