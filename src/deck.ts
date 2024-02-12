import Phaser from 'phaser';
import Card from './card';
import * as CardConfig from './card_config';

export class Deck {
   private scene: Phaser.Scene;
   public cards: Card[] = [];

   constructor(gameScene: Phaser.Scene) {
      this.scene = gameScene;

      //Make the card face Graphics Game Object
      const cardFace = this.scene.make.graphics();
      cardFace.fillStyle(0xffffff);
      cardFace.fillRoundedRect(
         0,
         0,
         CardConfig.Size.WIDTH,
         CardConfig.Size.HEIGHT,
         CardConfig.Size.CORNER
      );
      cardFace.generateTexture(
         'cardFront',
         CardConfig.Size.WIDTH,
         CardConfig.Size.HEIGHT
      );

      //Make the card character BitmapText Game Object
      const cardChar = this.scene.make.bitmapText({
         text: '',
         font: CardConfig.Font.NAME,
         size: CardConfig.Size.CHAR_SIZE,
         add: false,
      });

      //Make the card suit BitmapText Game Object
      const cardSuit = this.scene.make.bitmapText({
         text: '',
         font: CardConfig.Font.NAME,
         size: CardConfig.Size.SUIT_SIZE,
         add: false,
      });

      for (let s = 0; s < Object.keys(CardConfig.Suits).length / 2; ++s) {
         cardSuit.text = CardConfig.SuitChars[s];
         cardSuit.setTint(CardConfig.SuitColors[s]);
         cardChar.setTint(CardConfig.SuitColors[s]);

         for (
            let v = 1;
            v < Object.keys(CardConfig.Values).length / 2 + 1;
            ++v
         ) {
            cardChar.text = CardConfig.ValueChars[v];

            //Create a texture name based on value and suit
            const texID = `tex${CardConfig.Values[v]}of${CardConfig.Suits[s]}`;

            //Make a dynamic texture for this card
            const dynTex = this.scene.textures.addDynamicTexture(
               texID,
               CardConfig.Size.WIDTH,
               CardConfig.Size.HEIGHT
            );

            //Presuming the texture exists, draw the card elements to it
            dynTex?.draw(cardFace, 0, 0);
            dynTex?.draw(
               cardChar.setOrigin(0).setRotation(0),
               CardConfig.Size.MARGIN_LEFT,
               CardConfig.Size.MARGIN_TOP
            );
            dynTex?.draw(
               cardChar.setRotation(Math.PI),
               CardConfig.Size.WIDTH - CardConfig.Size.MARGIN_RIGHT,
               CardConfig.Size.HEIGHT - CardConfig.Size.MARGIN_BOTTOM
            );
            // Draw the card suit in the center of the dynamic texture
            dynTex?.draw(
               cardSuit.setOrigin(0.5), // Set the origin of the card suit to its center
               CardConfig.Size.WIDTH * 0.5, // Position it at half the width of the card
               CardConfig.Size.HEIGHT * 0.5 // Position it at half the height of the card
            );

            // Draw a border on the dynamic texture
            const graphics = this.scene.add.graphics();
            graphics.lineStyle(1, 0x000000); // Set the line style to a 1px black line 
            graphics.strokeRoundedRect(    // Draw the border
               0,
               0,
               CardConfig.Size.WIDTH,
               CardConfig.Size.HEIGHT,
               CardConfig.Size.CORNER
            );
            dynTex?.draw(graphics.generateTexture('border', CardConfig.Size.WIDTH, CardConfig.Size.HEIGHT), 0, 0); // Draw the border onto the dynamic texture
            graphics.destroy(); // Destroys the graphics object as it's no longer needed


            // Create a new card object with the suit, value, and game object
            // The game object is an image created from the dynamic texture
            this.cards.push({
               suit: s,
               value: v,
               gameObject: this.scene.make.image({ key: texID }),
            });
         }
      }
   }

   // Shuffle the cards using the Fisher-Yates algorithm
   private Shuffle() {
      for (let i = this.cards.length - 1; i > 0; --i) {
         const j = Math.floor(Math.random() * (i + 1));
         [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
      }
   }
   
   // Deals cards in a setup for racing demon
   public Deal = () => {
      this.Shuffle(); // Shuffle the cards

      // Initialize the piles
      const demonPile = [];
      const middleStack1 = [];
      const middleStack2 = [];
      const middleStack3 = [];
      const middleStack4 = [];
      const drawPile = [];
  
      // Deal four cards at the top-middle of the screen
      for (let i = 0; i < 4; ++i) {
         
         this.cards[i].gameObject.scale = 0.5; // Scale down the card image
  
         // Position the card horizontally in the middle of the screen, offset by the card width + 25% of the card width
         this.cards[i].gameObject.x = this.scene.game.scale.width / 2 + (i - 2) * (this.cards[i].gameObject.displayWidth + this.cards[i].gameObject.displayWidth * 0.25);
  
         // Position the card vertically at the top of the screen, offset by 2/3 of the card height
         this.cards[i].gameObject.y = this.cards[i].gameObject.displayHeight;

         // Make the card object interactive
         this.cards[i].gameObject.setInteractive();

         // Add an input event listener to the card
         this.cards[i].gameObject.on('pointerdown', () => {
            // When the card is clicked, log its suit and value to the console
            console.log(CardConfig.Values[this.cards[i].value]  + " of " +
               CardConfig.Suits[this.cards[i].suit]);
         });
      }
      

      // Deal a stack of 13 cards
      for (let i = 4; i < 17; ++i) {
         const card = this.cards.pop(); // Remove the card from the deck
         demonPile.push(card); // Add the card to the demon pile

         this.cards[i].gameObject.scale = 0.5; // Scale down the card image
  
         // Position the card horizontally on the left side of the screen
         this.cards[i].gameObject.x = this.cards[i].gameObject.displayWidth * 2;
  
         // Position the card vertically, offset by the card index times 1/13 of the card height
         this.cards[i].gameObject.y = this.cards[i].gameObject.displayHeight;

         // Set the depth of the card to its index, so that higher index cards (which are at the top of the scene) appear on top
         this.cards[i].gameObject.setDepth(-i);
         this.cards[i].gameObject.setDataEnabled();

         // Make the card object interactive
         this.cards[i].gameObject.setInteractive({ draggable: true });
         /*this.scene.input.setDraggable(this.cards[i].gameObject);*/

         //Store the original position of the card
         this.cards[i].gameObject.data.set('originalPosition', { x: this.cards[i].gameObject.x, y: this.cards[i].gameObject.y });

         this.cards[i].gameObject.on('drag', (_pointer: any, dragX: number, dragY: number) => {
            this.cards[i].gameObject.x = dragX;
            this.cards[i].gameObject.y = dragY;
         });

         this.cards[i].gameObject.on('pointerdown', () => {
            this.cards[i].gameObject.setTint(0x44ff44);
         });
         
         this.cards[i].gameObject.on('pointerup', () => {
            this.cards[i].gameObject.clearTint();
            console.log(this.cards[i].gameObject.data.get('originalPosition'));

            // If the condition is not met, move the card back to its original position
            if (true) {
               const originalPosition = this.cards[i].gameObject.data.get('originalPosition');
               this.cards[i].gameObject.x = originalPosition.x;
               this.cards[i].gameObject.y = originalPosition.y;
            }
         });

         
         // Add an input event listener to the card
         this.cards[i].gameObject.on('pointerdown', () => {
            // When the card is clicked, log its suit and value to the console
            console.log(CardConfig.Values[this.cards[i].value]  + " of " +
               CardConfig.Suits[this.cards[i].suit]);
         });
      }
      
      // The remaining cards go to the draw pile
      drawPile.push(...this.cards);
      /* this.cards = []; */ // Clear the deck

      // Deal the draw pile
  }

   /*
   // Deals a full deck of cards in a grid
   public Deal() {
      this.Shuffle(); // Shuffle the cards
      for (let i = 0; i < this.cards.length; ++i) {
         this.cards[i].gameObject.scale = 0.5; // Scale down the card image

         // Position the card horizontally based on its index and the width of the game screen
         this.cards[i].gameObject.x =
            (this.scene.game.scale.width / 13) * (i % 13) +
            this.cards[i].gameObject.displayWidth * 0.58;

         // Position the card vertically based on its index and the height of the game screen
         this.cards[i].gameObject.y =
            (this.scene.game.scale.height / 4) * Math.floor(i / 13) +
            this.cards[i].gameObject.displayHeight * 0.78;


         // Make the card object interactive
         this.cards[i].gameObject.setInteractive();

         // Add an input event listener to the card
         this.cards[i].gameObject.on('pointerdown', () => {
            // When the card is clicked, log its suit and value to the console
            console.log(CardConfig.Values[this.cards[i].value]  + " of " +
               CardConfig.Suits[this.cards[i].suit]);
         });


         // Add the card to the display list so it will be rendered
         this.cards[i].gameObject.addToDisplayList();
      }
   }*/
}
