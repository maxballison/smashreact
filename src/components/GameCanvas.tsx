import React, { useEffect, useRef, useState } from 'react';
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
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const GameCanvas: React.FC<GameCanvasProps> = ({ players, stage, localPlayerId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize renderer and game engine when component mounts or props change
  useEffect(() => {
    if (!canvasRef.current || players.length === 0 || !localPlayerId) {
      console.log("Skipping initialization, missing critical data:", {
        canvas: !!canvasRef.current,
        playerCount: players.length,
        localPlayerId: localPlayerId || 'missing'
      });
      return;
    }

    if (isInitialized) {
      // Already initialized, just update players and stage
      if (stage) {
        gameEngine.setStage(stage);
      }
      return;
    }
    
    console.log("Initializing GameCanvas with:", { 
      players: players.length, 
      stage: stage?.id || 'none',
      localPlayerId 
    });
    
    // Make sure canvas size is set properly before initialization
    const canvas = canvasRef.current;
    canvas.width = 1280;
    canvas.height = 720;
    
    // Initialize renderer with canvas
    renderer.init(canvas);
    
    // Set up game engine
    gameEngine.setRenderCallback((players, stage) => {
      renderer.render(players, stage);
    });
    
    // Create a valid game state
    const gameState = {
      roomId: 'game-room',
      players: [...players], // Make a copy to prevent any reference issues
      stage: stage ? stage.id : 'battlefield',
      isActive: true,
      startTime: Date.now(),
      gameTime: 0,
      stockCount: 3,
      timeLimit: 180,
    };
    
    // Initialize the game engine
    gameEngine.init(gameState, localPlayerId);
    
    // Set stage if available
    if (stage) {
      gameEngine.setStage(stage);
    }
    
    setIsInitialized(true);
    
    // Draw initial frame
    renderer.render(players, stage);
    
    // Clean up on unmount
    return () => {
      console.log("GameCanvas unmounting - cleaning up game engine");
      gameEngine.stop();
    };
  }, [players, stage, localPlayerId, isInitialized]);

  // Re-render when players or stage change
  useEffect(() => {
    if (isInitialized && canvasRef.current) {
      renderer.render(players, stage);
    }
  }, [players, stage, isInitialized]);

  return (
    <CanvasContainer>
      <Canvas ref={canvasRef} />
    </CanvasContainer>
  );
};

export default GameCanvas;