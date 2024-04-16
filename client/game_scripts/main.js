//import Phaser, { GameObjects, Textures } from './phaser';
//import Card from './card.js';
//import crypto from 'crypto';
import { suits, values} from './card_config.js';
import { centerPileX, centerPileY, endPileX, endPileY, centerPileX2, centerPileY2, endPileX2, endPileY2 } from './card_config.js';
import { Deck } from './deck.js';
import { createDeckBottom } from './deck_bottom.js';
import { renderCards, renderEndCards } from './render.js';
import { sendPiles, updatePiles, createAllCards, showGameOverPopup } from './card_scripts.js';
/*import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';*/

let gameTimer = 0;
let timeSinceLastMove = 0;
let canRender = true;
let gameOver = false;
let decks = [];
let playerIDs = [];

const roomID = localStorage.getItem('roomID');
const userID = localStorage.getItem('userID');
playerIDs.push(userID);
console.log(roomID);

export const socket = io({
   auth: { 
      userID: localStorage.getItem('userID'),
      roomID: localStorage.getItem('roomID')
   }
});

socket.on('connect', () => {
   //let userID = localStorage.getItem('userID');
   if (!userID) {
      userID = socket.id;
      localStorage.setItem('userID', userID);
   }
   // This needs error handling
   socket.emit('joinGame', { roomID }, (response) => {
      if (response.success) {
         //socket.join(roomID);
        // If the server responded with success, navigate to the game page
        // window.location.href = `../pages/game.html`;
      } else {
        // If the server responded with an error, display the error message
        const errorMessage = document.createElement('p');
        errorMessage.textContent = response.message;
        document.querySelector('.input-field').appendChild(errorMessage);
      }
   });
});

socket.on('userJoined', (message) => {
   console.log(message);
});

// When any outbout event occurs, sets time since last update to 0
/*socket.onAnyOutgoing(() => {
   timeSinceLastMove = 0;
});*/


// Create multiple scenes with cameras rotated for each player, move socket methods out of the scene.add
//   and the variables in the scene moved outside, unless I want it to be unoptimized as fuck.
//   

let deckBottom = [];

class Player1Scene extends Phaser.Scene {
   constructor() {
      super('Player1Scene');
      this.mousePositionText = null;
      this.demonPileCount = null;
      this.deckPileCount = null;
      this.decks = [];
   }

   preload() {
      this.load.spritesheet(
         'cardsSpades',
         '../assets/Top-Down/Cards/Spades-88x124.png',
         { frameWidth: 88, frameHeight: 124 }
      );
      this.load.spritesheet(
         'cardsClubs',
         '../assets/Top-Down/Cards/Clubs-88x124.png',
         { frameWidth: 88, frameHeight: 124 }
      );
      this.load.spritesheet(
         'cardsDiamonds',
         '../assets/Top-Down/Cards/Diamonds-88x124.png',
         { frameWidth: 88, frameHeight: 124 }
      );
      this.load.spritesheet(
         'cardsHearts',
         '../assets/Top-Down/Cards/Hearts-88x124.png',
         { frameWidth: 88, frameHeight: 124 }
      );
      this.load.spritesheet(
         'cardBacks',
         '../assets/Top-Down/Cards/Card_Back-88x124.png',
         { frameWidth: 88, frameHeight: 124 }
      );
      this.load.spritesheet(
         'cardsDecks',
         '../assets/Top-Down/Cards/Card_DeckA-88x140.png',
         { frameWidth: 88, frameHeight: 140 }
      );
   }

   create() {
      this.scene.launch('Player2Scene');
      this.scene.launch('Player3Scene');
      this.scene.launch('Player4Scene');

      //console.log(this.scene.manager.scenes);

      

      this.cameras.main.setBackgroundColor('#408080');
      this.cameras.main.setViewport(0, 0, 650, 750);

      createDeckBottom(this);

      this.mousePositionText = this.add.text(5, 5, '', { font: '16px Courier', fill: '#ffffff' });
      this.demonPileCount = this.add.text(149, 422, '', { font: '16px Courier', fill: '#ffffff' });
      this.deckPileCount = this.add.text(69, 539, '', { font: '16px Courier', fill: '#ffffff' });

      // Draw the places cards can be placed
      for (let i = 0; i < centerPileX.length; i++) {
         deckBottom.push(this.add.sprite(centerPileX[i], centerPileY - 104, 'cards' + suits[i], 0).setTint(0x408080));
         deckBottom[i].setDepth(0);
      }
      for (let i = 0; i < centerPileX.length; i++) {
         deckBottom.push(this.add.sprite(centerPileX[i], centerPileY, 'deckBottomTexture'));
      }
      // Deck bottom
      deckBottom.push(this.add.sprite(75, centerPileY + 120, 'deckBottomTexture'));
      // Demon pile bottom
      deckBottom.push(this.add.sprite(156, endPileY[0] + 104, 'deckBottomTexture'));
      // Draw pile bottom
      deckBottom.push(this.add.sprite(156, centerPileY + 120, 'deckBottomTexture'));

      // Draw the deck sprite
      let deckSprite = this.add.sprite(75, 608, 'cardsDecks', 1);
      deckSprite.setInteractive();
      //deckSprite.setScale(0.5);

      
      this.children.each(child => {
         if (typeof child.setScale === 'function') {
           child.setScale(0.75);
         }
      });
      

      // Deal the cards, is here for the player scene only
      socket.emit('dealCards', userID);
      /*setTimeout(() => {
         renderCards(this);
      }, 500);*/


      socket.on('recievePiles', (userID, allPlayersCards) => {
         //console.log(userID);
         //console.log(allPlayersCards);
      
         allPlayersCards.forEach(allCards => {
            let foundDeck = decks.find(aDeck => aDeck.deck.userID === allCards.deck.userID);
            //console.log(decks.find(theseCards => theseCards.deck.userID === userID));
            //console.log(allCards.deck.userID);
            //console.log(playerIDs.length);
            if (!foundDeck) {
               if (playerIDs[0] !== allCards.deck.userID) {
                  playerIDs.push(allCards.deck.userID);
               }
            }
            if (allCards.demonPile.length === 0) {
               gameOver = true;
            }
         });

         playerIDs.forEach(playerID => {
            let allCards = allPlayersCards.find(cards => cards.deck.userID === playerID);
            if (!allCards) {
              console.error(`No cards found for user ID: ${playerID}`);
              return;
            }
          
            let foundDeck = decks.find(aDeck => aDeck.deck.userID === allCards.deck.userID);
            if (!foundDeck) {
              let scene = this.scene.manager.scenes[playerIDs.indexOf(playerID)];
              let newDeck = createAllCards(scene, allCards.deck.userID);
              let newDeck2 = createAllCards(this, allCards.deck.userID);
              decks.push(newDeck);
              // made for drawing endpiles
              this.decks.push(newDeck2);
              //console.log(this.decks);
            }
          
            if (allCards.demonPile.length === 0) {
              gameOver = true;
            }
          });
         
         //console.log(decks);


         playerIDs.forEach(playerID => {
            let allCards = allPlayersCards.find(cards => cards.deck.userID === playerID);
            if (!allCards) {
              console.error(`No cards found for user ID: ${playerID}`);
              return;
            }
          
            let foundDeck = decks.find(aDeck => aDeck.deck.userID === allCards.deck.userID);
            let foundDeck2 = this.decks.find(aDeck => aDeck.deck.userID === allCards.deck.userID);
            //console.log(foundDeck);
            let centerPilesData = allCards.centerPiles;
            let endPilesData = allCards.endPiles;
            let drawPileData = allCards.drawPile;
            let demonPileData = allCards.demonPile;
            let deckPileData = allCards.deckPile;
          
            let playerIndex = playerIDs.indexOf(foundDeck.deck.userID);
            //console.log(playerIndex);
            if (playerIndex !== -1) {
               let scene = this.scene.manager.scenes[playerIndex];
               //console.log(scene);
               updatePiles(scene, foundDeck, foundDeck.deck, centerPilesData, endPilesData, drawPileData, 
                  demonPileData, deckPileData, canRender);
               updatePiles(this, foundDeck2, foundDeck2.deck, centerPilesData, endPilesData, drawPileData,
                  demonPileData, deckPileData, canRender);
            } else {
              console.error(`No scene found for user ID: ${userID}`);
            }
            //console.log(decks);
          });
      
         if (gameOver) {
            // Make all items uninteractable
            this.input.enabled = false;
      
            // Show a game over message
            showGameOverPopup();
         }
      
      });


      // Functions happen on clicking on deck, should be converted to an event listener
      this.input.on('pointerdown', (_pointer) => {
         let allCards = decks.find(allCards => allCards.deck.userID === userID);
         //console.log(decks);
         //console.log(userID);
         // Dupe code on variable declarations, probably could be cleaned up to be nicer
         // These nested ifs look like trash, should be cleaned up soon
         var mouseX = this.input.mousePointer.x;
         var mouseY = this.input.mousePointer.y;
         if (mouseX >= 43 && mouseX <= 107 && mouseY >= 555 && mouseY <= 646) {
            let drawn = allCards.deck.drawCard(allCards.deckPile);
            if (drawn !== undefined) {
               allCards.drawPile.push(drawn);
               deckBottom[8].setVisible(false);
            } else {
               length = allCards.drawPile.length;
               for (let i = 0; i < length; i++) {
                  let card = allCards.drawPile.pop();
                  allCards.deckPile[i] = card;
                  //card.getAt(0).setVisible(false);
                  //card.getAt(0).setInteractive(false);
               }
            }
            console.log(allCards);
            sendPiles(allCards);
            renderCards(this, allCards, userID, centerPileX, centerPileY, endPileX, endPileY[0]);
            renderEndCards(this, this.decks, endPileX, endPileY);
         }
      });

      this.input.on('drag', (_pointer, container, dragX, dragY) => {
         let allCards = decks.find(allCards => allCards.deck.userID === userID);

         container.setData({x: container.x, y: container.y});
         container.x = dragX;
         container.y = dragY;
         let pile = container.getData('pile')
         let containerIndex = pile.indexOf(container);
         if ( !(pile === allCards.drawPile || pile === allCards.demonPile)) {
            for (let i = 0; i < pile.length; i++) {
               let card = pile[i];
               if (card.getAt(2).value <= container.getAt(2).value) {
                  card.x = container.x;
                  card.y = container.y + (15 * (i - containerIndex));
                  card.depth = container.depth + i; // Dont need the 1 but changing it might break things
               }
            }
         }
      });
      
      this.input.on('dragstart', (_pointer, container) => {
         let allCards = decks.find(allCards => allCards.deck.userID === userID);
         canRender = false;

         console.log(container.getAt(2).name)

         if (container.getData('pile') === allCards.drawPile) {
            container.setDepth(60);
         } else {
            for (let i = 0; i < container.getData('pile').length; i++) {
               container.getData('pile')[i].setDepth(60 + i);
            }
         }
         // Save the original position at the start of the drag
         container.setData('originX', container.x);
         container.setData('originY', container.y);
         
     });

      // Gonna cut up a bunch of this logic later now that I understand how it works, the server
      //   will be doing a lot of the work here, or probably checking the work before allowing it to happen
      this.input.on('dragend', (_pointer, container) => {
         // Find your own allCards object in decks to use
         let allCards = decks.find(allCards => allCards.deck.userID === userID);
         // console.log(allCards);

         canRender = true;

         var mouseX = this.input.mousePointer.x;
         var mouseY = this.input.mousePointer.y;
         for (let i = 0; i < centerPileX.length; i++) {
            // Y Position modifiers are for the height of the pile
            if (mouseX >= centerPileX[i] - 44 && mouseX <= centerPileX[i] + 44 &&
                  mouseY >= centerPileY + ((allCards.centerPiles[i].length - 1) * 20) - 62 && 
                  mouseY <= centerPileY + ((allCards.centerPiles[i].length - 1) * 20) + 62) {
               if (this.canAddToCenterPile(container, allCards.centerPiles[i][allCards.centerPiles[i].length - 1], allCards)) {
                  // Remove the card from its original pile
                  let originalPile = container.getData('pile');
                  let index = originalPile.indexOf(container);
                  if (index !== -1) {
                     let cardsToMove = originalPile.splice(index);
                     allCards.centerPiles[i].push(...cardsToMove);
                  }
                  break;
               }
               // Store a reference to the new pile in the card
               container.setData('pile', allCards.centerPiles[i]);
               break;
            } else if (mouseX >= endPileX[i] - 44 && mouseX <= endPileX[i] + 44 &&
                        mouseY >= endPileY[0] - 62 && mouseY <= endPileY[0] + 62) {
               for (let i = 0; i < allCards.endPiles.length; i++) {
                  if (this.canPlaceOnEndPile(container, allCards.endPiles[i], i)) {
                     // Remove the card from its original pile
                     let originalPile = container.getData('pile');
                     let index = originalPile.indexOf(container);
                     if (index !== -1) {
                           originalPile.splice(index, 1);
                     }
                     // Add the card to the end pile
                     allCards.endPiles[i].push(container);
   
                     // Store a reference to the new pile in the card
                     container.setData('pile', allCards.endPiles[i]);
                     break;
                  }
               }
               break;
            } else if (mouseX >= endPileX[i] - 44 && mouseX <= endPileX[i] + 44 &&
                        mouseY >= endPileY[1] - 62 && mouseY <= endPileY[1] + 62) {
               for (let i = 0; i < allCards.endPiles.length; i++) {
                  //console.log("IS WORKING 1" + i);
                  for (let i = 0; i < allCards.endPiles.length; i++) {
                     if (this.canPlaceOnEndPile(container, allCards.endPiles[i], i)) {
                        // Remove the card from its original pile
                        let originalPile = container.getData('pile');
                        let index = originalPile.indexOf(container);
                        if (index !== -1) {
                              originalPile.splice(index, 1);
                        }
                        // Add the card to the end pile
                        allCards.endPiles[i].push(container);
      
                        // Store a reference to the new pile in the card
                        container.setData('pile', allCards.endPiles[i]);
                        break;
                     }
                  }
               }
               break;
            } else if (mouseX >= endPileX[i] - 44 && mouseX <= endPileX[i] + 44 &&
                        mouseY >= endPileY[2] - 62 && mouseY <= endPileY[2] + 62) {
               
               for (let i = 0; i < allCards.endPiles.length; i++) {
                  //console.log("IS WORKING 2: " + i);
                  for (let i = 0; i < allCards.endPiles.length; i++) {
                     if (this.canPlaceOnEndPile(container, allCards.endPiles[i], i)) {
                        // Remove the card from its original pile
                        let originalPile = container.getData('pile');
                        let index = originalPile.indexOf(container);
                        if (index !== -1) {
                              originalPile.splice(index, 1);
                        }
                        // Add the card to the end pile
                        allCards.endPiles[i].push(container);
      
                        // Store a reference to the new pile in the card
                        container.setData('pile', allCards.endPiles[i]);
                        break;
                     }
                  }
               }
               break;

               /*
                  Next problem to work on is syncing state with server, but should probably get some sleep first
               */

            } else if (mouseX >= endPileX[i] - 44 && mouseX <= endPileX[i] + 44 &&
                        mouseY >= endPileY[3] - 62 && mouseY <= endPileY[3] + 62) {
               for (let i = 0; i < allCards.endPiles.length; i++) {
                  //console.log("IS WORKING 3" + i);
                  for (let i = 0; i < allCards.endPiles.length; i++) {
                     if (this.canPlaceOnEndPile(container, allCards.endPiles[i], i)) {
                        // Remove the card from its original pile
                        let originalPile = container.getData('pile');
                        let index = originalPile.indexOf(container);
                        if (index !== -1) {
                              originalPile.splice(index, 1);
                        }
                        // Add the card to the end pile
                        allCards.endPiles[i].push(container);
      
                        // Store a reference to the new pile in the card
                        container.setData('pile', allCards.endPiles[i]);
                        break;
                     }
                  }
               }
               break;
            }
         }  
         sendPiles(allCards);

         renderEndCards(this, this.decks, endPileX, endPileY);
         renderCards(this, allCards, allCards.deck.userID, centerPileX, centerPileY, endPileX, endPileY[0]);
         
      });
   }

   update() {
      let allCards = decks[0];

      var mouseX = this.input.mousePointer.x;
      var mouseY = this.input.mousePointer.y;
      mouseX = mouseX | 0;
      mouseY = mouseY | 0;
      this.mousePositionText.setText(`Mouse Position: (${mouseX}, ${mouseY})`);
      if (allCards !== undefined) {
         this.demonPileCount.setText(`${allCards.demonPile.length}`);
         this.deckPileCount.setText(`${allCards.deckPile.length}`);
      }

      if (this.playerID == null) {
         this.playerID = playerIDs[0];
      }
      //console.log(this);
      //console.log(this.playerID);

      timeSinceLastMove++;
      if ((timeSinceLastMove % 30) === 0) { // Using 300 because higher tickrate is annoying, lower it later to 30
         socket.emit('returnPiles');  // Fetches gamestate from server after 6 seconds of inactivity
         //console.log("Test1");
         if (canRender === true && decks[0] !== undefined) {
            //console.log(decks[0]);
            //console.log(playerIDs);
            //decks.forEach(allCards => {
               //console.log(allCards.deck.userID);
               renderCards(this, allCards, allCards.deck.userID, centerPileX, centerPileY, endPileX, endPileY[0]);
               renderEndCards(this, this.decks, endPileX, endPileY[0]);
           //});
        }
      }

   }



   canPlaceOnEndPile(container, pile, pileIndex) {
      // Check if the suit of the card matches the suit of the pile
      let card = container.getAt(2);
      if (card.suit !== pileIndex) {
          return false;
      }

      // If the pile is empty, it can only accept a card with the lowest value
      if (pile.length === 0) {
          return card.value === 0;
      } else {
          // If the pile is not empty, it can only accept a card with a value
          // that is one greater than the value of the top card in the pile
          let topCard = pile[pile.length - 1].getAt(2);
          return card.value === topCard.value + 1;
      }
   }

   flipCard(container, faceUp) {
      let card = container.getAt(2);
      // Initialized cards need to be flipped differently than cards that are already in the game
      if (card.faceDownObject.visible === card.faceUpObject.visible) {
         card.faceUp = !faceUp;
         card.faceUpObject.visible = card.faceUp;
      } else {
         card.faceUp = !card.faceUp;
         card.faceUpObject.visible = faceUp;
         card.faceDownObject.visible = !faceUp;
      }
   }

   canAddToCenterPile(cardToAdd, bottomCard, allCards) {
      // Check if the value of the card to add is one less than the value of the bottom card
      let cardAdd = cardToAdd.getAt(2);
      if (cardAdd.value === 12 && bottomCard === undefined) {
         return true;
      //  Proceed if the card is from the demonPile and the bottom card is undefined
      } else if (bottomCard === undefined && cardToAdd.getData('pile') === allCards.demonPile) {
         //console.log("Card is from demonPile");
         return true;
      } else if (bottomCard === undefined) {
         return false;
      }
      
      let cardBottom = bottomCard.getAt(2);
      //console.log(cardBottom.value);
      if (cardAdd.value !== cardBottom.value - 1) {
         return false;
      }
  
      // Check if the suits are of opposite colors
      const redSuits = [suits.Hearts, suits.Diamonds];
      const blackSuits = [suits.Clubs, suits.Spades];
  
      if ((redSuits.includes(cardAdd.suit) && redSuits.includes(cardBottom.suit)) ||
           (blackSuits.includes(cardAdd.suit) && blackSuits.includes(cardBottom.suit))) {
         return false;
      }
  
      // If the card passed both checks, it can be added to the pile
      return true;
   }


}



class Player2Scene extends Phaser.Scene {
   constructor() {
      super('Player2Scene');
      this.mousePositionText = null;
      this.demonPileCount = null;
      this.deckPileCount = null;
      this.playerID = null;
   }

   preload() {
      
   }

   create() {
      this.cameras.main.setBackgroundColor('#408080');
      this.cameras.main.setViewport(650, 0, 450, 250);

      createDeckBottom(this);

      this.mousePositionText = this.add.text(5, 5, '', { font: '16px Courier', fill: '#ffffff' });
      this.demonPileCount = this.add.text(110, 107, '', { font: '16px Courier', fill: '#ffffff' });
      this.deckPileCount = this.add.text(46, 20, '', { font: '16px Courier', fill: '#ffffff' });

      // Draw the places cards can be placed
      /*for (let i = 0; i < centerPileX2.length; i++) {
         deckBottom.push(this.add.sprite(centerPileX2[i], centerPileY2 - 90, 'cards' + suits[i], 0).setTint(0x408080));
         deckBottom[i].setDepth(0);
      }*/
      for (let i = 0; i < centerPileX2.length; i++) {
         deckBottom.push(this.add.sprite(centerPileX2[i], centerPileY2[0], 'deckBottomTexture'));
      }
      deckBottom.push(this.add.sprite(50, endPileY2, 'deckBottomTexture'));
      deckBottom.push(this.add.sprite(115, endPileY2, 'deckBottomTexture'));
      deckBottom.push(this.add.sprite(115, centerPileY2, 'deckBottomTexture'));

      let deckSprite = this.add.sprite(50, 63, 'cardsDecks', 1);
      deckSprite.setInteractive();
      //deckSprite.setScale(0.75);

      this.children.each(child => {
         if (typeof child.setScale === 'function') {
           child.setScale(0.5);
         }
      });
      

   }

   update() {
      let allCards = decks[1];

      var mouseX = this.input.mousePointer.x;
      var mouseY = this.input.mousePointer.y;
      mouseX = mouseX | 0;
      mouseY = mouseY | 0;
      this.mousePositionText.setText(`Mouse Position: (${mouseX}, ${mouseY})`);
      if (allCards !== undefined) {
         this.demonPileCount.setText(`${allCards.demonPile.length}`);
         this.deckPileCount.setText(`${allCards.deckPile.length}`);
      }
      
      if (this.playerID == null) {
         this.playerID = playerIDs[1];
      }
      //console.log(this);

      //timeSinceLastMove++;
      if ((timeSinceLastMove % 300) === 0) { // Using 300 because higher tickrate is annoying, lower it later to 30
         //socket.emit('returnPiles');  // Fetches gamestate from server after 6 seconds of inactivity
         //console.log("Test2");
         //console.log(decks);
         if (canRender === true && decks[1] !== undefined) {
            //console.log(decks);
            //console.log(playerIDs);
            let allCards = decks[1];
            //decks.forEach(allCards => {
               console.log(allCards.deck.userID);
               renderCards(this, allCards, allCards.deck.userID, centerPileX2, centerPileY2, endPileX2, endPileY2);
           //});
        }
      }

   }

}


class Player3Scene extends Phaser.Scene {
   constructor() {
      super('Player3Scene');
      this.mousePositionText = null;
      this.demonPileCount = null;
      this.deckPileCount = null;
      this.playerID = null;
   }

   preload() {

   }

   create() {
      this.cameras.main.setBackgroundColor('#408080');
      this.cameras.main.setViewport(650, 250, 450, 250);

      createDeckBottom(this);

      this.mousePositionText = this.add.text(5, 5, '', { font: '16px Courier', fill: '#ffffff' });
      this.demonPileCount = this.add.text(110, 107, '', { font: '16px Courier', fill: '#ffffff' });
      this.deckPileCount = this.add.text(46, 20, '', { font: '16px Courier', fill: '#ffffff' });

      // Draw the places cards can be placed
      /*for (let i = 0; i < centerPileX2.length; i++) {
         deckBottom.push(this.add.sprite(centerPileX2[i], centerPileY2 - 90, 'cards' + suits[i], 0).setTint(0x408080));
         deckBottom[i].setDepth(0);
      }*/
      for (let i = 0; i < centerPileX2.length; i++) {
         deckBottom.push(this.add.sprite(centerPileX2[i], centerPileY2, 'deckBottomTexture'));
      }
      deckBottom.push(this.add.sprite(50, endPileY2, 'deckBottomTexture'));
      deckBottom.push(this.add.sprite(115, endPileY2, 'deckBottomTexture'));
      deckBottom.push(this.add.sprite(115, centerPileY2, 'deckBottomTexture'));

      let deckSprite = this.add.sprite(50, 63, 'cardsDecks', 1);
      deckSprite.setInteractive();
      //deckSprite.setScale(0.75);

      this.children.each(child => {
         if (typeof child.setScale === 'function') {
           child.setScale(0.5);
         }
      });
      

   }

   update() {
      let allCards = decks[2];

      var mouseX = this.input.mousePointer.x;
      var mouseY = this.input.mousePointer.y;
      mouseX = mouseX | 0;
      mouseY = mouseY | 0;
      this.mousePositionText.setText(`Mouse Position: (${mouseX}, ${mouseY})`);
      if (allCards !== undefined) {
         this.demonPileCount.setText(`${allCards.demonPile.length}`);
         this.deckPileCount.setText(`${allCards.deckPile.length}`);
      }
      
      if (this.playerID == null) {
         this.playerID = playerIDs[2];
      }

      //timeSinceLastMove++;
      if ((timeSinceLastMove % 300) === 0) { // Using 300 because higher tickrate is annoying, lower it later to 30
         //socket.emit('returnPiles');  // Fetches gamestate from server after 6 seconds of inactivity
         //console.log("Test3");
         if (canRender === true && decks[2] !== undefined) {
            //console.log(decks);
            //console.log(playerIDs);
            //let allCards = decks[2];
            //decks.forEach(allCards => {
               //console.log(allCards.deck.userID);
               renderCards(this, allCards, allCards.deck.userID, centerPileX2, centerPileY2, endPileX2, endPileY2);
           //});
        }
      }

   }

}


class Player4Scene extends Phaser.Scene {
   constructor() {
      super('Player4Scene');
      this.mousePositionText = null;
      this.demonPileCount = null;
      this.deckPileCount = null;
      this.playerID = null;
   }

   preload() {

   }

   create() {
      this.cameras.main.setBackgroundColor('#408080');
      this.cameras.main.setViewport(650, 500, 450, 250);

      createDeckBottom(this);

      this.mousePositionText = this.add.text(5, 5, '', { font: '16px Courier', fill: '#ffffff' });
      this.demonPileCount = this.add.text(110, 107, '', { font: '16px Courier', fill: '#ffffff' });
      this.deckPileCount = this.add.text(46, 20, '', { font: '16px Courier', fill: '#ffffff' });

      // Draw the places cards can be placed
      /*for (let i = 0; i < centerPileX2.length; i++) {
         deckBottom.push(this.add.sprite(centerPileX2[i], centerPileY2 - 90, 'cards' + suits[i], 0).setTint(0x408080));
         deckBottom[i].setDepth(0);
      }*/
      for (let i = 0; i < centerPileX2.length; i++) {
         deckBottom.push(this.add.sprite(centerPileX2[i], centerPileY2, 'deckBottomTexture'));
      }
      deckBottom.push(this.add.sprite(50, endPileY2, 'deckBottomTexture'));
      deckBottom.push(this.add.sprite(115, endPileY2, 'deckBottomTexture'));
      deckBottom.push(this.add.sprite(115, centerPileY2, 'deckBottomTexture'));

      let deckSprite = this.add.sprite(50, 63, 'cardsDecks', 1);
      deckSprite.setInteractive();
      //deckSprite.setScale(0.75);

      this.children.each(child => {
         if (typeof child.setScale === 'function') {
           child.setScale(0.5);
         }
      });
      

   }

   update() {
      let allCards = decks[3];

      var mouseX = this.input.mousePointer.x;
      var mouseY = this.input.mousePointer.y;
      mouseX = mouseX | 0;
      mouseY = mouseY | 0;
      this.mousePositionText.setText(`Mouse Position: (${mouseX}, ${mouseY})`);
      if (allCards !== undefined) {
         this.demonPileCount.setText(`${allCards.demonPile.length}`);
         this.deckPileCount.setText(`${allCards.deckPile.length}`);
      }
      
      if (this.playerID == null) {
         this.playerID = playerIDs[3];
      }

      //timeSinceLastMove++;
      if ((timeSinceLastMove % 300) === 0) { // Using 300 because higher tickrate is annoying, lower it later to 30
         //socket.emit('returnPiles');  // Fetches gamestate from server after 6 seconds of inactivity
         //console.log("Test4");
         //console.log(userID);
         if (canRender === true && decks[3] !== undefined) {
            //console.log(decks);
            //console.log(playerIDs);
            //let allCards = decks[3];
            //decks.forEach(allCards => {
               //console.log(allCards.deck.userID);
               renderCards(this, allCards, allCards.deck.userID, centerPileX2, centerPileY2, endPileX2, endPileY2);
           //});
         }
      }

   }
}

//const randomId = () => crypto.randomBytes(8).toString("hex");

/*
const player1Config = {
   type: Phaser.AUTO,
   scene: [Player1Scene],
   parent: 'player1Scene',
   scale: {
      width: 900,//1500,
      height: 900,//1023,
      mode: Phaser.Scale.NONE,
      //autoCenter: Phaser.Scale.CENTER_BOTH,
   },
   mipmapFilter: 'LINEAR_MIPMAP_NEAREST',
};

const player2Config = {
   type: Phaser.AUTO,
   scene: [Player2Scene],
   parent: 'player2Scene',
   scale: {
      width: 900,//1500,
      height: 450,//1023,
      mode: Phaser.Scale.NONE,
      //autoCenter: Phaser.Scale.CENTER_BOTH,
   },
   mipmapFilter: 'LINEAR_MIPMAP_NEAREST',
};

const player3Config = {
   type: Phaser.AUTO,
   scene: [Player3Scene],
   parent: 'player3Scene',
   scale: {
      width: 900,//1500,
      height: 450,//1023,
      mode: Phaser.Scale.NONE,
      //autoCenter: Phaser.Scale.CENTER_BOTH,
   },
   mipmapFilter: 'LINEAR_MIPMAP_NEAREST',
};

const player4Config = {
   type: Phaser.AUTO,
   scene: [Player4Scene],
   parent: 'player4Scene',
   scale: {
      width: 900,//1500,
      height: 450,//1023,
      mode: Phaser.Scale.NONE,
      //autoCenter: Phaser.Scale.CENTER_BOTH,
   },
   mipmapFilter: 'LINEAR_MIPMAP_NEAREST',
};
*/

const config = {
   type: Phaser.AUTO,
   scene: [Player1Scene, Player2Scene, Player3Scene, Player4Scene],
   parent: 'game',
   scale: {
      width: 1200,//1500,
      height: 1500,//1023,
      mode: Phaser.Scale.NONE,
      //autoCenter: Phaser.Scale.CENTER_BOTH,
   },
   mipmapFilter: 'LINEAR_MIPMAP_NEAREST',
};



export const game = new Phaser.Game(config);

//const scene1 = new Phaser.Scene(player1Config);
//const scene2 = new Phaser.Scene(player2Config);
//const scene3 = new Phaser.Scene(player3Config);
//const scene4 = new Phaser.Scene(player4Config);

/*
//game.scene.start('Player1Scene');
game.scene.launch('Player2Scene');
game.scene.launch('Player3Scene');
game.scene.launch('Player4Scene');
*/

/*game.scene.add('Player1Scene', Player1Scene, true);
game.scene.add('Player2Scene', Player2Scene, true);
game.scene.add('Player3Scene', Player3Scene, true);
game.scene.add('Player4Scene', Player4Scene, true);*/


