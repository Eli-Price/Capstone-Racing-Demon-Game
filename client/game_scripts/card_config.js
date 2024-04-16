// These enums are a gross hack, but it works pretty good.
//NON CONST enum for reverse mapping
export const suits = (() => {
   const _enum = {
      Hearts: 0,
      Diamonds: 1,
      Clubs: 2,
      Spades: 3,
   };

   const _reverseEnum = {};
   for (const key in _enum) {
      _reverseEnum[_enum[key]] = key;
   }
   return Object.freeze(Object.assign({}, _enum, _reverseEnum));
})();

//NON CONST enum for reverse mapping
export const values = (() => {
   const _enum = {
      Ace: 0,
      Two: 1,
      Three: 2,
      Four: 3,
      Five: 4,
      Six: 5,
      Seven: 6,
      Eight: 7,
      Nine: 8,
      Ten: 9,
      Jack: 10,
      Queen: 11,
      King: 12,
   };

   const _reverseEnum = {};
   for (const key in _enum) {
      _reverseEnum[_enum[key]] = key;
   }
   return Object.freeze(Object.assign({}, _enum, _reverseEnum));
})();

/*
// Positions of the piles in player1Scene
export const centerPileX = [320, 420, 520, 620].map(x => x * 0.75);
export const centerPileY = 520 * 0.75;
export const endPileX = [320, 420, 520, 620].map(x => x * 0.75);
export const endPileY = 380 * 0.75;
*/

// Positions of the piles in player1Scene
export const centerPileX = [320, 420, 520, 620].map(x => x * 0.75);
export const centerPileY = 645 * 0.75;
export const endPileX = [320, 420, 520, 620].map(x => x * 0.75);
export const endPileY = [378, 278, 178, 78];
/*export const drawPileX = 100 * 0.75;
export const drawPileY = 700 * 0.75;
export const demonPileX = 100 * 0.75;
export const demonPileY = 700 * 0.75;*/

// Positions of the piles in other player scenes
export const centerPileX2 = [320, 420, 520, 620].map(x => x * 0.5);
export const centerPileY2 = 120 * 0.5;
export const endPileX2 = [320, 420, 520, 620].map(x => x * 0.5);
export const endPileY2 = 120 * 0.5;
/*export const drawPileX2 = 100 * 0.75;
export const drawPileY2 = 700 * 0.75;
export const demonPileX2 = 100 * 0.75;
export const demonPileY2 = 700 * 0.75;*/
