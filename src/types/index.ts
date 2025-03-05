export interface Player {
  id: string;
  username: string;
  character: string;
  position: Vector2D;
  velocity: Vector2D;
  direction: number;
  isJumping: boolean;
  isAttacking: boolean;
  attackType: string | null;
  health: number;
  damage: number;
  stocks: number;
  lastInput?: Record<string, boolean>;
  lastProcessedInput?: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface GameState {
  roomId: string;
  players: Player[];
  stage: string;
  isActive: boolean;
  startTime: number;
  gameTime: number;
  stockCount: number;
  timeLimit: number;
}

export interface CharacterData {
  id: string;
  name: string;
  sprite: string;
  animations: {
    idle: string[];
    run: string[];
    jump: string[];
    fall: string[];
    attack1: string[];
    attack2: string[];
    hit: string[];
  };
  stats: {
    speed: number;
    weight: number;
    jumpHeight: number;
    attackPower: number;
  };
}

export interface StageData {
  id: string;
  name: string;
  background: string;
  platforms: {
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
  bounds: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
}
