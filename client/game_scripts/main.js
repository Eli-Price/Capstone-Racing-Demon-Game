import * as Phaser from 'phaser'; //{ Phaser, Scene, AUTO, GameObjects, Scale, Game } from 'phaser';
//import Card from './card.js';
import { suits, values} from './card_config.js';
import { centerPileX, centerPileY, endPileX, endPileY, centerPileX2, centerPileY2, endPileX2, endPileY2 } from './card_config.js';
import { Deck } from './deck.js';
import { createDeckBottom } from './deck_bottom.js';
import { renderCards, renderEndCards } from './render.js';
import { sendPiles, updatePiles, createAllCards, showGameOverPopup } from './card_scripts.js';


let gameTimer = 0;
let timeSinceLastMove = 0;
let canFire = true;
let canRender = true;
let gameOver = false;
let decks = [];
let playerIDs = [];
let allEndPiles = [];

const roomID = localStorage.getItem('roomID');
const userID = localStorage.getItem('userID');
playerIDs.push(userID);
console.log(userID);
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
        // window.location.href = `../pages/game.html`;
      } else {
        // If the server responded with an error, display the error message
        const errorMessage = document.createElement('p');
        errorMessage.textContent = response.message;
        //document.querySelector('.input-field').appendChild(errorMessage);
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

class Player1Scene extends Phaser.Scene {
   constructor() {
      super('Player1Scene');
      this.mousePositionText = null;
      this.demonPileCount = null;
      this.deckPileCount = null;
      this.decks = [];
      this.deckBottom = [];
      this.playerText = null;
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

      this.cameras.main.setBackgroundColor('#408080');
      this.cameras.main.setViewport(25, 25, 650, 740);

      const graphics = this.add.graphics({ fillStyle: { color: 0x106d6d } });

      graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
      graphics.fillStyle(0x408080, 1);
      graphics.fillRoundedRect(0, 0, this.cameras.main.width, this.cameras.main.height, 20);
      const mask = graphics.createGeometryMask();
      mask.invertAlpha = true;

      const frame = this.add.graphics({ fillStyle: { color: 0x408080 } });
      frame.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
      frame.setMask(mask);
      frame.setDepth(9999);


      createDeckBottom(this);

      this.playerText = this.add.text(15, 15, '', { font: '20px Courier', fill: '#ffffff' });
      this.demonPileCount = this.add.text(149, 422, '', { font: '16px Courier', fill: '#ffffff' });
      this.deckPileCount = this.add.text(69, 539, '', { font: '16px Courier', fill: '#ffffff' });

      // Draw the places cards can be placed
      for (let i = 0; i < centerPileX.length; i++) {
         this.deckBottom.push(this.add.sprite(centerPileX[i], centerPileY - 104, 'cards' + suits[i], 0).setTint(0x408080));
         //console.log(this.deckBottom.at(-1).setData('name', 'endPiles' + suits[i]));
         this.deckBottom[i].setDepth(0);
      }
      for (let i = 0; i < centerPileX.length; i++) {
         this.deckBottom.push(this.add.sprite(centerPileX[i], centerPileY - 204, 'cards' + suits[i], 0).setTint(0x408080));
         this.deckBottom[i].setDepth(0);
      }
      for (let i = 0; i < centerPileX.length; i++) {
         this.deckBottom.push(this.add.sprite(centerPileX[i], centerPileY - 304, 'cards' + suits[i], 0).setTint(0x408080));
         this.deckBottom[i].setDepth(0);
      }
      for (let i = 0; i < centerPileX.length; i++) {
         this.deckBottom.push(this.add.sprite(centerPileX[i], centerPileY - 404, 'cards' + suits[i], 0).setTint(0x408080));
         this.deckBottom[i].setDepth(0);
      }
      
      // Deck bottoms for the center piles 
      for (let i = 0; i < centerPileX.length; i++) {
         this.deckBottom.push(this.add.sprite(centerPileX[i], centerPileY, 'deckBottomTexture'));
      }
      // Deck bottom
      this.deckBottom.push(this.add.sprite(75, centerPileY + 120, 'deckBottomTexture'));
      // Demon pile bottom
      this.deckBottom.push(this.add.sprite(156, endPileY[0] + 80, 'deckBottomTexture'));
      // Draw pile bottom
      this.deckBottom.push(this.add.sprite(156, centerPileY + 120, 'deckBottomTexture'));

      // Draw the deck sprite
      let deckSprite = this.add.sprite(75, 608, 'cardsDecks', 1);
      deckSprite.setInteractive();
      //deckSprite.setScale(0.5);

      
      this.children.each(child => {
         if (typeof child.setScale === 'function' && child.type !== 'Graphics') {
           child.setScale(0.75);
         }
      });

      // Deal the cards, is here for the player scene only
      socket.emit('dealCards', userID);
      socket.emit('returnPiles'); // fetch inital gamestate on join

      socket.on('gameOver', (data) => {
         const p1Score = data.scores[0];
         const p2Score = data.scores[1];
         const p3Score = data.scores[2];
         const p4Score = data.scores[3];
         gameOver = data.gameOver;
         const winnerID = data.winner;

         // handle the game over state and the score
         if (gameOver) {
            this.input.enabled = false;
            showGameOverPopup(p1Score, p2Score, p3Score, p4Score, winnerID, userID);
            //socket.removeAllListeners();
         }
      });

      //socket.to(roomID).emit('sendReq');

      socket.on('recieveReq', () => {
         let allCards = decks.find(allCards => allCards.deck.userID === userID);
         sendPiles(this, allCards);
      });


      socket.on('recievePiles', (userID, allPlayersCards, endPiles) => {
         // console.log(endPilesData);
         allEndPiles = endPiles;
         //console.log(allEndPiles);
      
         allPlayersCards.forEach(allCards => {
            let foundDeck = decks.find(aDeck => aDeck.deck.userID === allCards.deck.userID);
            if (!foundDeck) {
               if (playerIDs[0] !== allCards.deck.userID) {
                  playerIDs.push(allCards.deck.userID);
               }
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
              let newDeck2 = createAllCards(this, userID);
              decks.push(newDeck);
              // made for drawing endpiles
              this.decks.push(newDeck2);
            }
            //socket.emit('checkGameOver');
            if (allCards.demonPile.length === 10 && gameOver === false) {
               socket.emit('checkGameOver');
            }
         });
         
         //console.log(decks);

         let count = 0;
         playerIDs.forEach(playerID => {
            let allCards = allPlayersCards.find(cards => cards.deck.userID === playerID);
            if (!allCards) {
              console.error(`No cards found for user ID: ${playerID}`);
              return;
            }
          
            let foundDeck = decks.find(aDeck => aDeck.deck.userID === allCards.deck.userID);
            //let foundDeck2 = this.decks[count];
            //console.log(foundDeck);
            let endPilesData = endPiles[count];
            //console.log(endPilesData);
            let centerPilesData = allCards.centerPiles;
            let drawPileData = allCards.drawPile;
            let demonPileData = allCards.demonPile;
            let deckPileData = allCards.deckPile;
          
            let playerIndex = playerIDs.indexOf(foundDeck.deck.userID);
            if (playerIndex !== -1) {
               let scene = this.scene.manager.scenes[playerIndex];
               // Updates the references for all scenes
               updatePiles(scene, foundDeck, foundDeck.deck, centerPilesData, endPilesData, drawPileData, 
                  demonPileData, deckPileData, canRender);
               // Updates the references for the player scene
               updatePiles(this, this.decks[count], this.decks[count].deck, centerPilesData, endPilesData, drawPileData,
                  demonPileData, deckPileData, canRender);
            } else {
              console.error(`No scene found for user ID: ${userID}`);
            }
            count++;
         });
      
         /*if (gameOver) {
            // Make all items uninteractable
            this.input.enabled = false;
      
            // Show a game over message
            showGameOverPopup();
         }*/
      
      });


      // Functions happen on clicking on deck, should be converted to an event listener
      this.input.on('pointerdown', (_pointer) => {
         let allCards = decks.find(allCards => allCards.deck.userID === userID);
         var mouseX = _pointer.x;
         var mouseY = _pointer.y;
         if (mouseX >= 65 && mouseX <= 132 && mouseY >= 581 && mouseY <= 673) {
            for (let i = 0; i < 3; i++) {
               let drawn = allCards.deck.drawCard(allCards.deckPile);
               if (drawn !== undefined) {
                  allCards.drawPile.push(drawn);
               } else {
                  length = allCards.drawPile.length;
                  for (let i = 0; i < length; i++) {
                     let card = allCards.drawPile.pop();
                     allCards.deckPile[i] = card;
                  }
               }
            }  
            this.deckPileCount.setText(`${allCards.deckPile.length}`);
            renderCards(this, allCards, userID, centerPileX, centerPileY, endPileX, endPileY[0], allEndPiles);

            sendPiles(this, allCards);

            //renderEndCards(this, this.decks, endPileX, endPileY);
            renderCards(this, allCards, userID, centerPileX, centerPileY, endPileX, endPileY[0], allEndPiles);
         }
      });

      this.input.on('drag', (_pointer, container, dragX, dragY) => {
         let allCards = decks.find(allCards => allCards.deck.userID === userID);

         /*if (this.scene.key !== this.scene.manager.getActiveScene().key) {
            return;
         }*/

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
                  card.depth = container.depth + i;
               }
            }
         }
      });
      
      this.input.on('dragstart', (_pointer, container) => {
         let allCards = decks.find(allCards => allCards.deck.userID === userID);
         container.setData('depth', container.depth);
         canRender = false;

         if (container.getData('pile') === allCards.drawPile) {
            container.setDepth(60000);
         } else {
            for (let i = 0; i < container.getData('pile').length; i++) {
               container.getData('pile')[i].setDepth(60000 + i);
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
         canRender = true;

         var mouseX = _pointer.x - 25;
         var mouseY = _pointer.y - 25;
         for (let i = 0; i < centerPileX.length; i++) {
            /*let bottomCard = allCards.centerPiles[i][allCards.centerPiles[i].length - 1];
            console.log(bottomCard.body);*/
            // Y Position modifiers are for the height of the pile
            if (mouseX >= centerPileX[i] - 44 && mouseX <= centerPileX[i] + 44 &&
                  mouseY >= centerPileY + ((allCards.centerPiles[i].length - 1) * 15) - 62 && 
                  mouseY <= centerPileY + ((allCards.centerPiles[i].length - 1) * 15) + 62) {
               if (this.canAddToCenterPile(container, allCards.centerPiles[i][allCards.centerPiles[i].length - 1], allCards)) {
                  // Remove the card from its original pile
                  let originalPile = container.getData('pile');
                  let index = originalPile.indexOf(container);
                  if (index !== -1) {
                     let cardsToMove = originalPile.splice(index);
                     allCards.centerPiles[i].push(...cardsToMove);
                  }
                  //sendPiles(this, allCards);

                  break;
               }
               // Store a reference to the new pile in the card
               container.setData('pile', allCards.centerPiles[i]);
               break;
            } else if (mouseX >= endPileX[i] - 44 && mouseX <= endPileX[i] + 44 &&
                        mouseY >= endPileY[0] - 62 && mouseY <= endPileY[0] + 62) {
               allCards = this.decks[0];
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
                     decks[0].endPiles[i].push(container);
                     //decks[0].allCards.endPiles[i].push(container);

                     // Store a reference to the new pile in the card
                     container.setData('pile', allCards.endPiles[i]);

                     let card = this.simplifyCard(container.getAt(2));
                     socket.emit('sendEndCard', card, 0, i);
                     //sendPiles(this, allCards);
                     timeSinceLastMove = 0;
                     socket.emit('sendReq');
                     //socket.emit('returnPiles');
                     
                     //renderEndCards(this, this.decks, endPileX, endPileY);

                     break;
                  }
               }
            } else if (mouseX >= endPileX[i] - 44 && mouseX <= endPileX[i] + 44 &&
                        mouseY >= endPileY[1] - 62 && mouseY <= endPileY[1] + 62) {
               if (this.decks[1]) {   
                  allCards = this.decks[1];
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
                        decks[1].endPiles[i].push(container);
                        //decks[1].allCards.endPiles[i].push(container);
      
                        // Store a reference to the new pile in the card
                        container.setData('pile', allCards.endPiles[i]);

                        let card = this.simplifyCard(container.getAt(2));
                        socket.emit('sendEndCard', card, 1, i);
                        //sendPiles(this, allCards);
                        timeSinceLastMove = 0;
                        socket.emit('sendReq');
                        //socket.emit('returnPiles');

                        //renderEndCards(this, this.decks, endPileX, endPileY);

                        break;  
                     }
                  }
               }
               break;
            } else if (mouseX >= endPileX[i] - 44 && mouseX <= endPileX[i] + 44 &&
                        mouseY >= endPileY[2] - 62 && mouseY <= endPileY[2] + 62) {
               if (this.decks[2]) {
                  allCards = this.decks[2];
                  for (let i = 0; i < allCards.endPiles.length; i++) {
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
                           decks[2].endPiles[i].push(container);
                           //decks[2].allCards.endPiles[i].push(container);
         
                           // Store a reference to the new pile in the card
                           container.setData('pile', allCards.endPiles[i]);

                           let card = this.simplifyCard(container.getAt(2));
                           socket.emit('sendEndCard', card, 2, i);
                           //sendPiles(this, allCards);
                           timeSinceLastMove = 0;
                           socket.emit('sendReq');
                           //socket.emit('returnPiles');

                           //renderEndCards(this, this.decks, endPileX, endPileY);

                           break;
                        }
                     }
                  }
               }
            } else if (mouseX >= endPileX[i] - 44 && mouseX <= endPileX[i] + 44 &&
                        mouseY >= endPileY[3] - 62 && mouseY <= endPileY[3] + 62) {
               if (this.decks[3]) {   
                  allCards = this.decks[3];
                  for (let i = 0; i < allCards.endPiles.length; i++) {
                     if (this.canPlaceOnEndPile(container, allCards.endPiles[i], i)) {
                        console.log(this.canPlaceOnEndPile(container, allCards.endPiles[i], i));
                        // Remove the card from its original pile
                        let originalPile = container.getData('pile');
                        let index = originalPile.indexOf(container);
                        if (index !== -1) {
                           originalPile.splice(index, 1);
                        }
                        
                        // Add the card to the end pile
                        allCards.endPiles[i].push(container);
                        decks[3].endPiles[i].push(container);
                        //decks[3].allCards.endPiles[i].push(container);

                        // Store a reference to the new pile in the card
                        container.setData('pile', allCards.endPiles[i]);

                        let card = this.simplifyCard(container.getAt(2));
                        socket.emit('sendEndCard', card, 3, i);
                        sendPiles(this, allCards);
                        timeSinceLastMove = 0;
                        socket.emit('sendReq');
                        //socket.emit('returnPiles');

                        //renderEndCards(this, this.decks, endPileX, endPileY);

                        break;
                     }
                  }
               }
            }
         } 
         allCards = decks.find(allCards => allCards.deck.userID === userID); 
         sendPiles(this, decks[0]);
         setInterval(() => {}, 10);

         renderCards(this, allCards, allCards.deck.userID, centerPileX, centerPileY, endPileX, endPileY[0], allEndPiles);
         //renderEndCards(this, this.decks, endPileX, endPileY);
         
      });
   }

   update() {
      let allCards = decks[0];
      if (allCards !== undefined) {
         this.playerText.setText(`${allCards.deck.userID}`);
      }

      // var mouseX = this.input.mousePointer.x;
      // var mouseY = this.input.mousePointer.y;
      // mouseX = mouseX | 0;
      // mouseY = mouseY | 0;
      // this.mousePositionText.setText(`Mouse Position: (${mouseX}, ${mouseY})`);
      /*if (allCards !== undefined) {
         this.demonPileCount.setText(`${allCards.demonPile.length}`);
         console.log(allCards.deckPile.length);
         this.deckPileCount.setText(`${allCards.deckPile.length}`);
      }*/

      if (this.playerID == null) {
         this.playerID = playerIDs[0];
      }
      //console.log(this);
      //console.log(this.playerID);

      timeSinceLastMove++;
      if ((timeSinceLastMove % 20) === 0) {
         //socket.emit('returnPiles');  
         if (canRender === true && decks[0] !== undefined) {
            this.playerText.setText(`${allCards.deck.userID}`);
            this.demonPileCount.setText(`${allCards.demonPile.length}`);
            console.log(allCards.deckPile.length);
            this.deckPileCount.setText(`${allCards.deckPile.length}`);
            
            renderCards(this, allCards, allCards.deck.userID, centerPileX, centerPileY, endPileX, endPileY[0], allEndPiles);
            renderEndCards(this, decks, endPileX, endPileY[0]);
        }
      }

   }

   simplifyCard(card) {
      let cardData = {name : '', suit : 0, value : 0, owner: userID};
      cardData.name = card.name;
      cardData.suit = card.suit;
      cardData.value = card.value;

      return cardData;
   }

   canPlaceOnEndPile(container, pile, pileIndex) {
      // Check if the suit of the card matches the suit of the pile
      //console.log(pile);
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
      this.deckBottom = [];
   }

   preload() {
      
   }

   create() {
      this.cameras.main.setBackgroundColor('#408080');
      this.cameras.main.setViewport(700, 25, 365, 230);


      const graphics = this.add.graphics({ fillStyle: { color: 0x106d6d } });

      graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
      graphics.fillStyle(0x408080, 1);
      graphics.fillRoundedRect(0, 0, this.cameras.main.width, this.cameras.main.height, 20);
      const mask = graphics.createGeometryMask();
      mask.invertAlpha = true;

      const frame = this.add.graphics({ fillStyle: { color: 0x408080 } });
      frame.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
      frame.setMask(mask);
      frame.setDepth(9999);


      createDeckBottom(this);

      this.playerText = this.add.text(15, 15, ``, { font: '20px Courier', fill: '#ffffff' });
      this.demonPileCount = this.add.text(100, 20, '', { font: '18px Courier', fill: '#ffffff' });
      this.deckPileCount = this.add.text(44, 104, '', { font: '18px Courier', fill: '#ffffff' });

      for (let i = 0; i < centerPileX2.length; i++) {
         this.deckBottom.push(this.add.sprite(centerPileX2[i], centerPileY2, 'deckBottomTexture'));
      }
      // Deck
      this.deckBottom.push(this.add.sprite(50, endPileY2 + 82, 'deckBottomTexture'));
      // Demon
      this.deckBottom.push(this.add.sprite(106, endPileY2 + 82, 'deckBottomTexture'));
      // Draw
      this.deckBottom.push(this.add.sprite(106, centerPileY2, 'deckBottomTexture'));

      let deckSprite = this.add.sprite(50, 146, 'cardsDecks', 1);
      deckSprite.setInteractive();
      //deckSprite.setScale(0.75);

      this.children.each(child => {
         if (typeof child.setScale === 'function' && child.type !== 'Graphics') {
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

      if (allCards !== undefined) {
         this.playerText.setText(`${allCards.deck.userID}`);
         this.demonPileCount.setText(`${allCards.demonPile.length}`);
         this.deckPileCount.setText(`${allCards.deckPile.length}`);
      }
      
      if (this.playerID == null) {
         this.playerID = playerIDs[1];
      }

      //timeSinceLastMove++;
      if ((timeSinceLastMove % 120) === 0) { // 2 seconds to update non player scenes
         if (canRender === true && decks[1] !== undefined) {
            let allCards = decks[1];
            renderCards(this, allCards, allCards.deck.userID, centerPileX2, centerPileY2, endPileX2, endPileY2, allEndPiles);
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
      this.playerText = null;
      this.playerID = null;
      this.deckBottom = [];
   }

   preload() {

   }

   create() {
      this.cameras.main.setBackgroundColor('#408080');
      this.cameras.main.setViewport(700, 280, 365, 230);


      const graphics = this.add.graphics({ fillStyle: { color: 0x106d6d } });

      graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
      graphics.fillStyle(0x408080, 1);
      graphics.fillRoundedRect(0, 0, this.cameras.main.width, this.cameras.main.height, 20);
      const mask = graphics.createGeometryMask();
      mask.invertAlpha = true;

      const frame = this.add.graphics({ fillStyle: { color: 0x408080 } });
      frame.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
      frame.setMask(mask);
      frame.setDepth(9999);


      createDeckBottom(this);

      this.playerText = this.add.text(15, 15, ``, { font: '20px Courier', fill: '#ffffff' });
      this.demonPileCount = this.add.text(100, 20, '', { font: '18px Courier', fill: '#ffffff' });
      this.deckPileCount = this.add.text(44, 94, '', { font: '18px Courier', fill: '#ffffff' });

      for (let i = 0; i < centerPileX2.length; i++) {
         this.deckBottom.push(this.add.sprite(centerPileX2[i], centerPileY2, 'deckBottomTexture'));
      }
      // Deck
      this.deckBottom.push(this.add.sprite(50, endPileY2 + 82, 'deckBottomTexture'));
      // Demon
      this.deckBottom.push(this.add.sprite(106, endPileY2 + 82, 'deckBottomTexture'));
      // Draw
      this.deckBottom.push(this.add.sprite(106, centerPileY2, 'deckBottomTexture'));

      let deckSprite = this.add.sprite(50, 146, 'cardsDecks', 1);
      deckSprite.setInteractive();
      //deckSprite.setScale(0.75);

      this.children.each(child => {
         if (typeof child.setScale === 'function' && child.type !== 'Graphics') {
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
      
      if (allCards !== undefined) {
         this.playerText.setText(`${allCards.deck.userID}`);
         this.demonPileCount.setText(`${allCards.demonPile.length}`);
         this.deckPileCount.setText(`${allCards.deckPile.length}`);
      }
      
      if (this.playerID == null) {
         this.playerID = playerIDs[2];
      }

      //timeSinceLastMove++;
      if ((timeSinceLastMove % 120) === 0) { // 2 seconds to update non player scenes
         if (canRender === true && decks[2] !== undefined) {
            renderCards(this, allCards, allCards.deck.userID, centerPileX2, centerPileY2, endPileX2, endPileY2, allEndPiles);
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
      this.playerText = null;
      this.playerID = null;
      this.deckBottom = [];
   }

   preload() {

   }

   create() {
      this.cameras.main.setBackgroundColor('#408080');
      this.cameras.main.setViewport(700, 535, 365, 230);


      const graphics = this.add.graphics({ fillStyle: { color: 0x106d6d } });

      graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
      graphics.fillStyle(0x408080, 1);
      graphics.fillRoundedRect(0, 0, this.cameras.main.width, this.cameras.main.height, 20);
      const mask = graphics.createGeometryMask();
      mask.invertAlpha = true;

      const frame = this.add.graphics({ fillStyle: { color: 0x408080 } });
      frame.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
      frame.setMask(mask);
      frame.setDepth(9999);


      createDeckBottom(this);

      this.playerText = this.add.text(15, 15, ``, { font: '20px Courier', fill: '#ffffff' });
      this.demonPileCount = this.add.text(100, 20, '', { font: '18px Courier', fill: '#ffffff' });
      this.deckPileCount = this.add.text(44, 94, '', { font: '18px Courier', fill: '#ffffff' });

      for (let i = 0; i < centerPileX2.length; i++) {
         this.deckBottom.push(this.add.sprite(centerPileX2[i], centerPileY2, 'deckBottomTexture'));
      }
      // Deck
      this.deckBottom.push(this.add.sprite(50, endPileY2 + 82, 'deckBottomTexture'));
      // Demon
      this.deckBottom.push(this.add.sprite(106, endPileY2 + 82, 'deckBottomTexture'));
      // Draw
      this.deckBottom.push(this.add.sprite(106, centerPileY2, 'deckBottomTexture'));

      let deckSprite = this.add.sprite(50, 146, 'cardsDecks', 1);
      deckSprite.setInteractive();
      //deckSprite.setScale(0.75);

      this.children.each(child => {
         if (typeof child.setScale === 'function' && child.type !== 'Graphics') {
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
      
      if (allCards !== undefined) {
         this.playerText.setText(`${allCards.deck.userID}`);
         this.demonPileCount.setText(`${allCards.demonPile.length}`);
         this.deckPileCount.setText(`${allCards.deckPile.length}`);
      }
      
      if (this.playerID == null) {
         this.playerID = playerIDs[3];
      }

      //timeSinceLastMove++;
      if ((timeSinceLastMove % 120) === 0) { // 2 seconds to update non player scenes
         if (canRender === true && decks[3] !== undefined) {
            renderCards(this, allCards, allCards.deck.userID, centerPileX2, centerPileY2, endPileX2, endPileY2, allEndPiles);
         }
      }
   }
}


const config = {
   type: Phaser.AUTO,
   scene: [Player1Scene, Player2Scene, Player3Scene, Player4Scene],
   parent: 'game',
   backgroundColor: '#106d6d',
   scale: {
      width: 1090,
      height: 790,
      mode: Phaser.Scale.NONE,
      //autoCenter: Phaser.Scale.CENTER_BOTH,
   },
   mipmapFilter: 'LINEAR_MIPMAP_NEAREST',
   physics: {
      default: 'arcade',
      arcade: {
         debug: true,
      },
   },
};


export const game = new Phaser.Game(config);



