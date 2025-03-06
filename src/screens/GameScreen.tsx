import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import GameCanvas from '../components/GameCanvas';
import GameHUD from '../components/GameHUD';
import ResultScreen from '../components/ResultScreen';
import { Player } from '../types';
import socketService from '../services/socketService';
import audioService from '../services/audioService';
import gameEngine from '../game/gameEngine';
import { getStageById } from '../data/stages';

interface GameScreenProps {
  onReturn: () => void;
}

const Container = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: #000;
`;

interface GameState {
  players: Player[];
  timeRemaining: number;
  isPaused: boolean;
  isGameOver: boolean;
  results: any[] | null;
  stageId: string;
}

const GameScreen: React.FC<GameScreenProps> = ({ onReturn }) => {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    timeRemaining: 180, // 3 minutes
    isPaused: false,
    isGameOver: false,
    results: null,
    stageId: 'battlefield' // Default stage
  });
  
  useEffect(() => {
    console.log("GameScreen mounted, initializing game...");
    
    // Start the battle music
    audioService.playMusic('battle');
    
    // Set up socket listeners for game events
    socketService.setOnGameStart((data) => {
      console.log("Game start event received:", data);
      
      // Initialize with the received data
      setGameState(prevState => ({
        ...prevState,
        players: data.players,
        timeRemaining: data.timeLimit,
        stageId: data.stage
      }));
    });
    
    socketService.setOnGameUpdate((data) => {
      // Update the game state with new player data
      setGameState(prevState => ({
        ...prevState,
        players: data.players
      }));
      
      // Update the game engine state for rendering
      gameEngine.handleServerUpdate(data);
    });
    
    socketService.setOnGameEnd((data) => {
      console.log("Game end event received:", data);
      setGameState(prevState => ({
        ...prevState,
        isGameOver: true,
        results: data.results,
      }));
      
      // Play end game sound
      audioService.playSound('match_end');
      audioService.playMusic('results');
    });
    
    // Set up pause functionality
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        setGameState(prevState => ({
          ...prevState,
          isPaused: !prevState.isPaused
        }));
      }
    };
    
    // Set up timer
    const timerInterval = setInterval(() => {
      setGameState(prevState => {
        if (prevState.isPaused || prevState.isGameOver) return prevState;
        
        const newTimeRemaining = prevState.timeRemaining - 1;
        
        // Check if time ran out
        if (newTimeRemaining <= 0) {
          clearInterval(timerInterval);
          return {
            ...prevState,
            timeRemaining: 0,
          };
        }
        
        return {
          ...prevState,
          timeRemaining: newTimeRemaining
        };
      });
    }, 1000);
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Create dummy players if none exist yet (for testing/development)
    if (gameState.players.length === 0) {
      const localPlayerId = socketService.getSocketId() || 'player1';
      const dummyPlayers: Player[] = [
        {
          id: localPlayerId,
          username: 'You',
          character: 'fighter',
          position: { x: 400, y: 300 },
          velocity: { x: 0, y: 0 },
          direction: 1,
          isJumping: false,
          isAttacking: false,
          attackType: null,
          health: 0,
          damage: 0,
          stocks: 3,
          lastInput: {}
        },
        {
          id: 'player2',
          username: 'CPU',
          character: 'ninja',
          position: { x: 800, y: 300 },
          velocity: { x: 0, y: 0 },
          direction: -1,
          isJumping: false,
          isAttacking: false,
          attackType: null,
          health: 0,
          damage: 0,
          stocks: 3,
          lastInput: {}
        }
      ];
      
      setGameState(prevState => ({
        ...prevState,
        players: dummyPlayers
      }));
    }
    
    return () => {
      // Clean up
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(timerInterval);
      audioService.stopMusic();
      gameEngine.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // We intentionally use an empty dependency array here as we want this to 
  // run only once on mount, and we're using functional updates in setGameState

  const handleReturnToLobby = () => {
    onReturn();
  };
  
  // Get the local player ID
  const localPlayerId = socketService.getSocketId() || 'player1';
  
  // Get the current stage
  const stage = getStageById(gameState.stageId);
  
  console.log("Rendering GameScreen with:", {
    playerCount: gameState.players.length,
    stage: gameState.stageId,
    localPlayerId
  });
  
  return (
    <Container>
      {!gameState.isGameOver ? (
        <>
          <GameCanvas 
            players={gameState.players} 
            stage={stage}
            localPlayerId={localPlayerId}
          />
          <GameHUD 
            players={gameState.players}
            timeRemaining={gameState.timeRemaining}
            isPaused={gameState.isPaused}
          />
        </>
      ) : (
        <ResultScreen 
          results={gameState.results || []}
          onReturn={handleReturnToLobby}
        />
      )}
    </Container>
  );
};

export default GameScreen;