// All the scripts for rendering cards

import { endPileY2, endPileY } from "./card_config.js";
   
export function renderCards(scene, allCards, userID, centerPileX, centerPileY, centerPileX2, centerPileY2) {
  // Add the deck sprite
  let playerID = localStorage.getItem('userID');
  let isOwnDeck = playerID === userID;


  // Clears any cards that shouldn't be visible in the drawPile
  //console.log(allCards.deck.cards);
  allCards.deck.cards.forEach(card => {
    if (allCards.deckPile.includes(card)) {
      card.getAt(0).setVisible(false);
      card.setInteractive(false);
      card.x = 0;
    }

    allCards.endPiles.forEach(endPile => {
      if (endPile.includes(card)) {
        card.getAt(0).setVisible(false);
        card.setInteractive(false);
        card.x = 0;
      }
    });
     //console.log(scene.children);
  });
  
  // Draw each card at its appropriate position for centerPiles
  for (let i = 0; i < allCards.centerPiles.length; i++) {
     for (let j = 0; j < allCards.centerPiles[i].length; j++) {
        let card = allCards.centerPiles[i][j];
        //let card = scene.add.existing(allCards.centerPiles[i][j]);
        //card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
        card.setInteractive(isOwnDeck);
        if (isOwnDeck) { 
          scene.input.setDraggable(card);
        }
        card.x = centerPileX[i];
        if (isOwnDeck) {
          card.y = centerPileY + 15 * j;
        } else {
          card.y = centerPileY + 10 * j;
        }
        card.getAt(0).setVisible(true);
        card.setDepth(j);
        card.setData('pile', allCards.centerPiles[i]);
     }
  }

  // Draw each card at its appropriate position for drawPile
  for (let i = 0; i < allCards.drawPile.length; i++) {
     //let card = scene.add.existing(allCards.drawPile[i]);
     let card = allCards.drawPile[i];
     //card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
     card.setInteractive(isOwnDeck);
      //if (isOwnDeck) { 
        scene.input.setDraggable(card);
      //}
      if (!isOwnDeck) {
        card.x = 105;
        card.y = centerPileY2;
      } else {
        card.x = 156;
        card.y = centerPileY + 120;
      }
     //card.y = centerPileY;
     // Set faceup sprite to visible
     card.getAt(0).setVisible(true);
     card.setDepth(i + 4);
     card.setData('pile', allCards.drawPile);
  }

  // Draw each card at its appropriate position for demonPile
  for (let i = 0; i < allCards.demonPile.length; i++) {
    //let card = scene.add.existing(allCards.demonPile[i]);
    let card = allCards.demonPile[i];
    //card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
    card.setInteractive(isOwnDeck);
    if (isOwnDeck) { 
      scene.input.setDraggable(card);
    }
    if (!isOwnDeck) {
      card.x = 105;
      card.y = endPileY2 + 82;
    } else {
      card.x = 156;
      card.y = endPileY[0] + 80;
    }
    //card.y = centerPileY + 82;
    card.getAt(0).setVisible(true);
    card.setDepth(i + 4);
    // Store a reference to the pile in the card
    card.setData('pile', allCards.demonPile);
  }

  //scene.cameras.main.rotation = 2 * 3.1415926/2;\
  if (isOwnDeck) {
    scene.children.each(child => {
      if (typeof child.setScale === 'function'  && child.type !== 'Graphics') {
        child.setScale(0.75);
      }
    });
  } else {
    scene.children.each(child => {
      if (typeof child.setScale === 'function'  && child.type !== 'Graphics') {
        child.setScale(0.5);
      }
    });
  }

  // Need to make gamescene for the other players, or do this on containers of gameobjects
  /*if (isOwnDeck) {
     scene.cameras.main.rotation = 2 * 3.1415926/2;
  }*/


}

export function renderEndCards(scene, decks, endPileX, endPileY) {

  let count = 0;

  decks.forEach(deck => {
    deck.deck.cards.forEach(card => {
      scene.decks.forEach(deck2 => {
        deck2.endPiles.forEach(endPile => {
          if (card.getData('pile') == endPile) {
            card.getAt(0).setVisible(false);
            card.setInteractive(false);
            card.x = 0;
          }
        });
      });
    });
  });
  
  scene.decks.forEach(deck => {
    // Draw each card at its appropriate position for endPiles
    for (let i = 0; i < deck.endPiles.length; i++) {
      if (deck.endPiles[i].length > 0) {
        let j = deck.endPiles[i].length - 1; // Get the last card in the pile
        //let card = scene.add.existing(allCards.endPiles[i][j]);
        let card = deck.endPiles[i][j];
        //card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
        card.setInteractive(false);
        card.x = endPileX[i];
        card.y = (endPileY - 25) - count;
        if (card.getAt(0)){
            card.getAt(0).setVisible(true);
        }
        card.getAt(0).setDepth(j);
        card.setData('pile', deck.endPiles[i]);
      }
    }
    count += 100;

  });
}

