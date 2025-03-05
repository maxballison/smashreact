import { StageData } from '../types';

// Defined stages with platforms and boundaries
export const stages: StageData[] = [
  {
    id: 'battlefield',
    name: 'Battlefield',
    background: '/assets/stages/battlefield.png',
    platforms: [
      // Main platform
      { x: 300, y: 500, width: 600, height: 20 },
      // Smaller platforms
      { x: 400, y: 350, width: 200, height: 15 },
      { x: 200, y: 400, width: 150, height: 15 },
      { x: 850, y: 400, width: 150, height: 15 }
    ],
    bounds: {
      left: 0,
      right: 1280,
      top: 0,
      bottom: 800
    }
  },
  {
    id: 'final_destination',
    name: 'Final Destination',
    background: '/assets/stages/final_destination.png',
    platforms: [
      // Just one large platform
      { x: 200, y: 500, width: 880, height: 20 }
    ],
    bounds: {
      left: 0,
      right: 1280,
      top: 0,
      bottom: 800
    }
  },
  {
    id: 'small_battlefield',
    name: 'Small Battlefield',
    background: '/assets/stages/small_battlefield.png',
    platforms: [
      // Main platform
      { x: 350, y: 500, width: 500, height: 20 },
      // Two smaller platforms
      { x: 450, y: 350, width: 150, height: 15 },
      { x: 650, y: 350, width: 150, height: 15 }
    ],
    bounds: {
      left: 0,
      right: 1280,
      top: 0,
      bottom: 800
    }
  },
  {
    id: 'castle',
    name: 'Castle',
    background: '/assets/stages/castle.png',
    platforms: [
      // Asymmetric platforms for varied gameplay
      { x: 300, y: 500, width: 680, height: 20 },
      { x: 200, y: 400, width: 200, height: 15 },
      { x: 500, y: 350, width: 150, height: 15 },
      { x: 800, y: 450, width: 150, height: 15 },
      { x: 650, y: 250, width: 100, height: 15 }
    ],
    bounds: {
      left: 0,
      right: 1280,
      top: 0,
      bottom: 800
    }
  }
];

export const getStageById = (id: string): StageData => {
  const stage = stages.find(stage => stage.id === id);
  if (!stage) {
    // Return default stage if not found
    return stages[0];
  }
  return stage;
};
