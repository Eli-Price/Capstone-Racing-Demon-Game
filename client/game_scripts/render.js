// All the scripts for rendering cards

// This is more like what I will want to do, the server should be checking if a card goes on a stack,
   //   and then sending back the new state of the game
   // Or its just a socket.on for when the board state updates, but then ther probably needs to be more than one
   //    function to update the board unless I want to waste a ton of the servers time
   
export function renderCards(scene, allCards, userID, centerPileX, centerPileY, endPileX, endPileY) {
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
     card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
     card.setInteractive(isOwnDeck);
      //if (isOwnDeck) { 
        scene.input.setDraggable(card);
      //}
      if (!isOwnDeck) {
        card.x = 105;
      } else {
        card.x = 156;
      }
     card.y = centerPileY + 120;
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
    } else {
      card.x = 156;
    }
    card.y = centerPileY;
    card.getAt(0).setVisible(true);
    card.setDepth(i + 4);
    // Store a reference to the pile in the card
    card.setData('pile', allCards.demonPile);
  }

  //scene.cameras.main.rotation = 2 * 3.1415926/2;\
  if (isOwnDeck) {
    scene.children.each(child => {
      if (typeof child.setScale === 'function') {
        child.setScale(0.75);
      }
    });
  } else {
    scene.children.each(child => {
      if (typeof child.setScale === 'function') {
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
  scene.decks.forEach(deck => {
    // Draw each card at its appropriate position for endPiles
    for (let i = 0; i < deck.endPiles.length; i++) {
      if (deck.endPiles[i].length > 0) {
        let j = deck.endPiles[i].length - 1; // Get the last card in the pile
        //let card = scene.add.existing(allCards.endPiles[i][j]);
        let card = deck.endPiles[i][j];
        //card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
        //card.setInteractive(isOwnDeck);
        //if (isOwnDeck) { 
          //scene.input.setDraggable(card);
        //}
        card.x = endPileX[i];
        card.y = endPileY - count;
        if (card.getAt(0)){
            card.getAt(0).setVisible(true);
        }
        card.setDepth(j);
        card.setData('pile', deck.endPiles[i]);
      }
    }
    count += 100;
  });
}

