// All the scripts for rendering cards

// This is more like what I will want to do, the server should be checking if a card goes on a stack,
   //   and then sending back the new state of the game
   // Or its just a socket.on for when the board state updates, but then ther probably needs to be more than one
   //    function to update the board unless I want to waste a ton of the servers time
   
export function renderCards(scene, allCards, userID, centerPileX, centerPileY, endPileX, endPileY) {
  // Add the deck sprite
  let playerID = localStorage.getItem('userID');
  //console.log(allCards.deck.userID + " : " + playerID);
  //console.log(allCards.deck.userID != playerID);
  if (playerID != allCards.deck.userID) {
    centerPileY = centerPileY + 400;
    endPileY = endPileY + 400;
  }

  // Clears any cards that shouldn't be visible in the drawPile
  //console.log(allCards.deck.cards);
  allCards.deck.cards.forEach(card => {
     if (allCards.deckPile.includes(card)) {
        scene.children.remove(card);
     }
  });
  
  // Draw each card at its appropriate position for centerPiles
  for (let i = 0; i < allCards.centerPiles.length; i++) {
     for (let j = 0; j < allCards.centerPiles[i].length; j++) {
        let card = allCards.centerPiles[i][j];
        //let card = scene.add.existing(centerPiles[i][j]);
        //card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
        card.setInteractive(true);
        scene.input.setDraggable(card);
        card.x = centerPileX[i];
        card.y = centerPileY + 20 * j;
        card.getAt(0).setVisible(true);
        card.setDepth(j);
        card.setData('pile', allCards.centerPiles[i]);
     }
  }
  // Draw each card at its appropriate position for endPiles
  for (let i = 0; i < allCards.endPiles.length; i++) {
     if (allCards.endPiles[i].length > 0) {
        let j = allCards.endPiles[i].length - 1; // Get the last card in the pile
        //let card = scene.add.existing(endPiles[i][j]);
        let card = allCards.endPiles[i][j];
        //card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
        card.setInteractive(true);
        scene.input.setDraggable(card);
        card.x = endPileX[i];
        card.y = endPileY;
        if (card.getAt(0)){
           card.getAt(0).setVisible(true);
        }
        card.setDepth(j);
        card.setData('pile', allCards.endPiles[i]);
     }
  }
  // Draw each card at its appropriate position for drawPile
  for (let i = 0; i < allCards.drawPile.length; i++) {
     let card = scene.add.existing(allCards.drawPile[i]);
     //let card = drawPile[i];
     card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
     card.setInteractive(true);
     scene.input.setDraggable(card);
     card.x = 230;
     card.y = endPileY;
     // Set faceup sprite to visible
     card.getAt(0).setVisible(true);
     card.setDepth(i + 5);
     card.setData('pile', allCards.drawPile);
  }
  // Draw each card at its appropriate position for demonPile
  for (let i = 0; i < allCards.demonPile.length; i++) {
     let card = scene.add.existing(allCards.demonPile[i]);
     //card = demonPile[i];
     //card.setInteractive(new Phaser.Geom.Rectangle(-44, -62, 88, 124), Phaser.Geom.Rectangle.Contains);
     card.setInteractive(true);
     scene.input.setDraggable(card);
     card.x = 230;
     card.y = centerPileY;
     card.getAt(0).setVisible(true);
     card.setDepth(i + 5);
     // Store a reference to the pile in the card
     card.setData('pile', allCards.demonPile);
  }

  // Need to make gamescene for the other players, or do this on containers of gameobjects
  /*if (true) {
     scene.cameras.main.rotation += 4 * 3.1415926/2;
  }*/
}