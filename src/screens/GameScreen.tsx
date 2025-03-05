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
}

const GameScreen: React.FC<GameScreenProps> = ({ onReturn }) => {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    timeRemaining: 180, // 3 minutes
    isPaused: false,
    isGameOver: false,
    results: null,
  });
  
  useEffect(() => {
    // Start the battle music
    audioService.playMusic('battle');
    
    // Set up socket listeners for game events
    socketService.setOnGameUpdate((data) => {
      setGameState(prevState => ({
        ...prevState,
        players: data.players,
      }));
      
      // Update the game engine state
      gameEngine.handleServerUpdate(data);
    });
    
    socketService.setOnGameEnd((data) => {
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
    
    return () => {
      // Clean up
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(timerInterval);
      audioService.stopMusic();
    };
  }, []);
  
  const handleReturnToLobby = () => {
    onReturn();
  };
  
  // Get the local player ID
  const localPlayerId = socketService.getSocketId() || '';
  
  // Get the current stage
  const stage = getStageById('battlefield'); // Default to battlefield for now
  
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
