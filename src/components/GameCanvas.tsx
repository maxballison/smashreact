import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Player, StageData } from '../types';
import gameEngine from '../game/gameEngine';
import renderer from '../game/renderer';

interface GameCanvasProps {
  players: Player[];
  stage: StageData | null;
  localPlayerId: string;
}

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
  background-color: #87CEEB; /* Set a fallback background color - sky blue */
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const GameCanvas: React.FC<GameCanvasProps> = ({ players, stage, localPlayerId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize renderer and game engine when component mounts
  useEffect(() => {
    console.log("GameCanvas mounted with:", { 
      players: players.length, 
      stage: stage?.id || 'none',
      localPlayerId 
    });
    
    if (!canvasRef.current) {
      console.error("Canvas ref is null");
      return;
    }
    
    // Make sure canvas size is set properly before initialization
    const container = canvasRef.current.parentElement;
    if (container) {
      canvasRef.current.width = 1280;
      canvasRef.current.height = 720;
      console.log("Canvas dimensions set to:", canvasRef.current.width, "x", canvasRef.current.height);
    }
    
    // Initialize renderer with canvas
    renderer.init(canvasRef.current);
    
    // Set up game engine
    gameEngine.setRenderCallback((players, stage) => {
      console.log("Render callback called with:", { 
        players: players.length,
        playerIds: players.map(p => p.id).join(','),
        stage: stage?.id || 'none' 
      });
      renderer.render(players, stage);
    });
    
    // Initialize game state if we have players and a local player ID
    if (players.length > 0 && localPlayerId) {
      console.log("Initializing game engine with players:", players);
      
      // Create a valid game state
      const gameState = {
        roomId: 'local-game',
        players: [...players], // Make a copy to prevent any reference issues
        stage: stage ? stage.id : 'battlefield',
        isActive: true,
        startTime: Date.now(),
        gameTime: 0,
        stockCount: 3,
        timeLimit: 180,
      };
      
      console.log("Game state:", gameState);
      
      // Initialize the game engine
      gameEngine.init(gameState, localPlayerId);
      
      // Set stage if available
      if (stage) {
        console.log("Setting stage:", stage);
        gameEngine.setStage(stage);
      }
    } else {
      console.error("Cannot initialize game: missing players or localPlayerId", {
        players: players.length,
        localPlayerId: localPlayerId || 'missing'
      });
    }
    
    // Draw a test frame to make sure renderer is working
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        console.log("Drawing test frame");
        ctx.fillStyle = '#87CEEB'; // Sky blue
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.fillStyle = '#00FF00'; // Green
        ctx.fillRect(100, 100, 200, 200);
        ctx.font = '24px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText('Testing canvas rendering', 120, 150);
      } else {
        console.error("Failed to get canvas context");
      }
    }
    
    // Clean up on unmount
    return () => {
      console.log("GameCanvas unmounting - cleaning up game engine");
      gameEngine.stop();
    };
  }, [players, stage, localPlayerId]);

  return (
    <CanvasContainer>
      <Canvas ref={canvasRef} />
    </CanvasContainer>
  );
};

export default GameCanvas;
