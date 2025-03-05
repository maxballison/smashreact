import React, { useState, useEffect } from 'react';
import { createGlobalStyle } from 'styled-components';
import MenuScreen from './screens/MenuScreen';
import LobbyScreen from './screens/LobbyScreen';
import GameScreen from './screens/GameScreen';

// Global styles
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Arial', sans-serif;
  }
  
  body {
    overflow: hidden;
  }
`;

// Game states
type GameState = 'menu' | 'lobby' | 'game';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [username, setUsername] = useState<string>('');
  
  // Check if username is stored in localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      setGameState('lobby');
    }
  }, []);
  
  const handleLogin = (username: string) => {
    setUsername(username);
    localStorage.setItem('username', username);
    setGameState('lobby');
  };
  
  const handleLogout = () => {
    setUsername('');
    localStorage.removeItem('username');
    setGameState('menu');
  };
  
  const handleStartGame = () => {
    setGameState('game');
  };
  
  const handleReturnToLobby = () => {
    setGameState('lobby');
  };
  
  return (
    <>
      <GlobalStyle />
      
      {gameState === 'menu' && (
        <MenuScreen onLogin={handleLogin} />
      )}
      
      {gameState === 'lobby' && (
        <LobbyScreen 
          username={username}
          onStartGame={handleStartGame}
          onLogout={handleLogout}
        />
      )}
      
      {gameState === 'game' && (
        <GameScreen onReturn={handleReturnToLobby} />
      )}
    </>
  );
};

export default App;
