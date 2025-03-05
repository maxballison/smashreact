# React Smash Fighter

A 2D platform fighter game inspired by Super Smash Bros, built with React, TypeScript, and WebSockets for multiplayer functionality.

## Features

- 🎮 Fast-paced multiplayer platform fighter gameplay
- 🧍 Multiple unique characters with different stats and abilities
- 🏟️ Various stages with different layouts
- 🎵 Dynamic audio system with sound effects and music
- 🌐 Real-time multiplayer with client-server architecture
- ⚡ Responsive controls and physics system

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```
git clone <repository-url>
cd react-smash-fighter
```

2. Install dependencies for both client and server
```
# Install client dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### Running the Application

1. Start the server
```
cd server
npm run dev
```

2. In a new terminal, start the client
```
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Game Controls

- **Movement**: WASD keys
- **Jump**: Spacebar
- **Light Attack**: J key
- **Heavy Attack**: K key
- **Directional Attacks**: WASD + J/K
- **Pause**: ESC key

## Project Structure

- `/public` - Static assets like images and audio files
- `/src` - Client-side source code
  - `/components` - React components
  - `/screens` - Main screen components
  - `/game` - Game logic (physics, renderer, input handling)
  - `/services` - Socket and audio services
  - `/data` - Game data (characters, stages)
  - `/types` - TypeScript type definitions
- `/server` - Server-side code for multiplayer functionality

## Adding New Content

### Adding New Characters

1. Add character sprites to `/public/assets/characters/[character-name]/`
2. Update `src/data/characters.ts` with new character data
3. Update character types if needed in `src/types/index.ts`

### Adding New Stages

1. Add stage background to `/public/assets/stages/`
2. Update `src/data/stages.ts` with new stage data

## Technologies Used

- React
- TypeScript
- Socket.IO
- Express
- Styled Components
- HTML5 Canvas

## Future Improvements

- Add more characters and stages
- Implement character-specific special attacks
- Add power-ups and items
- Improve animations and visual effects
- Add game mode options (time, stock, etc.)
- Implement match history and statistics

## License

This project is licensed under the MIT License.
# smashreact
