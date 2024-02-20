import Phaser/*, { GameObjects }*/ from 'phaser';
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
      //deck.Shuffle();

      // Deck testing code
      console.log(deck.cards);
      let card17 = this.add.existing(deck.cards[17].container);
      card17.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
      this.input.setDraggable(card17);
      card17.x = 88;
      card17.y = 224;

      this.cameras.main.setBackgroundColor('#408080');

      //const card = this.add.sprite(88, 224, 'cardsDecks', 1);
      //card.setInteractive({ draggable: true });
      //this.input.setDraggable(card);

      let card12 = this.add.existing(deck.cards[12].container);
      deck.flipCard(deck.cards[12], true);
      card12.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
      this.input.setDraggable(card12);
      card12.x = 248;
      card12.y = 224;

      this.input.on('pointerdown', (_pointer: PointerEvent, container: Phaser.GameObjects.Container) => {
         //this.children.bringToTop(card.gameObject);
         console.log(container);
         if (container) {
            //deck.flipCard(container, !(container.faceUp));
         }
      });

      this.mousePositionText = this.add.text(10, 10, '', { color: '#ffffff' });

      this.input.on('drag', (_pointer: PointerEvent, parentContainer: Phaser.GameObjects.Container, 
                                dragX: number, dragY: number) => {
            parentContainer.x = dragX;
            parentContainer.y = dragY;
         }
      );
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
