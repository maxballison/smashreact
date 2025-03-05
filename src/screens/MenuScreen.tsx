import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import Login from '../components/Login';
import audioService from '../services/audioService';

interface MenuScreenProps {
  onLogin: (username: string) => void;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const Container = styled.div`
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  animation: ${fadeIn} 2s ease-out forwards;
`;

const Background = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/assets/backgrounds/menu_bg.jpg');
  background-size: cover;
  background-position: center;
  opacity: 0.2;
  z-index: 0;
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 4rem;
  color: white;
  text-transform: uppercase;
  margin-bottom: 20px;
  text-align: center;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  animation: ${float} 6s ease-in-out infinite;
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: #aaa;
  margin-bottom: 50px;
  text-align: center;
  max-width: 600px;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    padding: 0 20px;
  }
`;

const Controls = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  padding: 20px;
  border-radius: 10px;
  margin-top: 40px;
  width: 100%;
  max-width: 500px;
`;

const ControlsTitle = styled.h3`
  color: white;
  text-align: center;
  margin-top: 0;
  margin-bottom: 20px;
`;

const ControlsList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
`;

const ControlItem = styled.div`
  display: flex;
  align-items: center;
`;

const ControlKey = styled.div`
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  padding: 5px 10px;
  min-width: 80px;
  text-align: center;
  color: white;
  font-weight: bold;
  margin-right: 10px;
`;

const ControlAction = styled.div`
  color: #ccc;
`;

const MuteButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 1.5rem;
  transition: background-color 0.2s;
  z-index: 10;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const MenuScreen: React.FC<MenuScreenProps> = ({ onLogin }) => {
  const [isMuted, setIsMuted] = useState(false);
  
  useEffect(() => {
    // Play menu music when the component mounts
    audioService.playMusic('menu');
    
    // Clean up when component unmounts
    return () => {
      // Stop menu music if component unmounts
      // (though the audio service will handle transitions)
    };
  }, []);
  
  const handleToggleMute = () => {
    const mutedState = audioService.toggleMute();
    setIsMuted(mutedState);
  };
  
  const handleLogin = (username: string) => {
    audioService.playSound('select');
    onLogin(username);
  };
  
  return (
    <Container>
      <Background />
      
      <MuteButton onClick={handleToggleMute}>
        {isMuted ? '🔇' : '🔊'}
      </MuteButton>
      
      <Content>
        <Title>React Smash Fighter</Title>
        <Subtitle>
          A fast-paced multiplayer fighting game inspired by Super Smash Bros
        </Subtitle>
        
        <Login onLogin={handleLogin} />
        
        <Controls>
          <ControlsTitle>Game Controls</ControlsTitle>
          <ControlsList>
            <ControlItem>
              <ControlKey>WASD</ControlKey>
              <ControlAction>Movement</ControlAction>
            </ControlItem>
            <ControlItem>
              <ControlKey>Space</ControlKey>
              <ControlAction>Jump</ControlAction>
            </ControlItem>
            <ControlItem>
              <ControlKey>J</ControlKey>
              <ControlAction>Light Attack</ControlAction>
            </ControlItem>
            <ControlItem>
              <ControlKey>K</ControlKey>
              <ControlAction>Heavy Attack</ControlAction>
            </ControlItem>
            <ControlItem>
              <ControlKey>WASD+J/K</ControlKey>
              <ControlAction>Directional Attacks</ControlAction>
            </ControlItem>
            <ControlItem>
              <ControlKey>ESC</ControlKey>
              <ControlAction>Pause Game</ControlAction>
            </ControlItem>
          </ControlsList>
        </Controls>
      </Content>
    </Container>
  );
};

export default MenuScreen;
