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
