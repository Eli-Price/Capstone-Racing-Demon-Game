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

// Positions of the piles

export const centerPileX = [315, 405, 495, 585];
export const centerPileY = 225;
export const endPileX = [315, 405, 495, 585];
export const endPileY = 90;

export const centerPileX2 = [420, 540, 660, 780].map(x => x * 0.5);
export const centerPileY2 = 300 * 0.5;
export const endPileX2 = [420, 540, 660, 780].map(x => x * 0.5);
export const endPileY2 = 120 * 0.5;
