import { CharacterData } from '../types';

// Character data with stats and animations
export const characters: CharacterData[] = [
  {
    id: 'fighter',
    name: 'Fighter',
    sprite: '/assets/characters/fighter/idle.png',
    animations: {
      idle: ['/assets/characters/fighter/idle.png'],
      run: ['/assets/characters/fighter/run1.png', '/assets/characters/fighter/run2.png'],
      jump: ['/assets/characters/fighter/jump.png'],
      fall: ['/assets/characters/fighter/fall.png'],
      attack1: ['/assets/characters/fighter/attack1.png'],
      attack2: ['/assets/characters/fighter/attack2.png'],
      hit: ['/assets/characters/fighter/hit.png'],
    },
    stats: {
      speed: 7,
      weight: 5,
      jumpHeight: 6,
      attackPower: 8
    }
  },
  {
    id: 'ninja',
    name: 'Ninja',
    sprite: '/assets/characters/ninja/idle.png',
    animations: {
      idle: ['/assets/characters/ninja/idle.png'],
      run: ['/assets/characters/ninja/run1.png', '/assets/characters/ninja/run2.png'],
      jump: ['/assets/characters/ninja/jump.png'],
      fall: ['/assets/characters/ninja/fall.png'],
      attack1: ['/assets/characters/ninja/attack1.png'],
      attack2: ['/assets/characters/ninja/attack2.png'],
      hit: ['/assets/characters/ninja/hit.png'],
    },
    stats: {
      speed: 9,
      weight: 3,
      jumpHeight: 8,
      attackPower: 6
    }
  },
  {
    id: 'brute',
    name: 'Brute',
    sprite: '/assets/characters/brute/idle.png',
    animations: {
      idle: ['/assets/characters/brute/idle.png'],
      run: ['/assets/characters/brute/run1.png', '/assets/characters/brute/run2.png'],
      jump: ['/assets/characters/brute/jump.png'],
      fall: ['/assets/characters/brute/fall.png'],
      attack1: ['/assets/characters/brute/attack1.png'],
      attack2: ['/assets/characters/brute/attack2.png'],
      hit: ['/assets/characters/brute/hit.png'],
    },
    stats: {
      speed: 4,
      weight: 9,
      jumpHeight: 4,
      attackPower: 10
    }
  },
  {
    id: 'mage',
    name: 'Mage',
    sprite: '/assets/characters/mage/idle.png',
    animations: {
      idle: ['/assets/characters/mage/idle.png'],
      run: ['/assets/characters/mage/run1.png', '/assets/characters/mage/run2.png'],
      jump: ['/assets/characters/mage/jump.png'],
      fall: ['/assets/characters/mage/fall.png'],
      attack1: ['/assets/characters/mage/attack1.png'],
      attack2: ['/assets/characters/mage/attack2.png'],
      hit: ['/assets/characters/mage/hit.png'],
    },
    stats: {
      speed: 6,
      weight: 4,
      jumpHeight: 5,
      attackPower: 9
    }
  }
];

export const getCharacterById = (id: string): CharacterData => {
  const character = characters.find(char => char.id === id);
  if (!character) {
    // Return default character if not found
    return characters[0];
  }
  return character;
};
