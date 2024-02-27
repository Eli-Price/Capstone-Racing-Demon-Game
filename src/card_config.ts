export const enum Font {
   NAME = 'cardFont',
   IMAGE = '/fonts/CardCharacters.png',
   CONFIG = '/fonts/CardCharacters.xml',
}

//NON CONST enum for reverse mapping
export enum Suits {
   Hearts,
   Diamonds,
   Clubs,
   Spades,
}

//NON CONST enum for reverse mapping
export enum Values {
   Ace = 0,
   Two = 1,
   Three = 2,
   Four = 3,
   Five = 4,
   Six = 5,
   Seven = 6,
   Eight = 7,
   Nine = 8,
   Ten = 9,
   Jack = 10,
   Queen = 11,
   King = 12,
}

export const SuitChars = ['}', '{', '[', ']'];
export const ValueChars = [
   '',
   'A',
   '2',
   '3',
   '4',
   '5',
   '6',
   '7',
   '8',
   '9',
   '=',
   'J',
   'Q',
   'K',
];
