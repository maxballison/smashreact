import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Lobby from '../components/Lobby';
import CharacterSelect from '../components/CharacterSelect';
import { Player } from '../types';
import socketService from '../services/socketService';
import audioService from '../services/audioService';
import { characters } from '../data/characters';
import { stages } from '../data/stages';

interface LobbyScreenProps {
  username: string;
  onStartGame: () => void;
  onLogout: () => void;
}

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Logo = styled.h1`
  color: white;
  margin: 0;
`;

const LogoutButton = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const Tab = styled.div<{ $active: boolean }>`
  padding: 10px 20px;
  color: white;
  background-color: ${props => props.$active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 5px 5px 0 0;
  margin-right: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`;

const TabContent = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0 5px 5px 5px;
  padding: 20px;
`;

const LobbyScreen: React.FC<LobbyScreenProps> = ({
  username,
  onStartGame,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'lobby' | 'character'>('character');
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomId, setRoomId] = useState<string>('');
  const [selectedCharacter, setSelectedCharacter] = useState<string>(characters[0].id);
  const [selectedStage, setSelectedStage] = useState<string>(stages[0].id);
  
  useEffect(() => {
    // Play menu music
    audioService.playMusic('menu');
    
    // Connect to server
    socketService.connect('http://localhost:3001');
    
    // Set up socket listeners
    socketService.setOnConnect(() => {
      // Join lobby after connection
      socketService.joinLobby(username);
    });
    
    socketService.setOnLobbyUpdate((data) => {
      setPlayers(data.players);
      setRoomId(data.roomId);
      setSelectedStage(data.stage);
    });
    
    socketService.setOnGameStart(() => {
      // Play start game sound
      audioService.playSound('match_start');
      onStartGame();
    });
    
    return () => {
      socketService.disconnect();
    };
  }, [username, onStartGame]);
  
  const handleSelectCharacter = (characterId: string) => {
    setSelectedCharacter(characterId);
    audioService.playSound('select');
    socketService.selectCharacter(characterId);
  };
  
  const handleSelectStage = (stageId: string) => {
    setSelectedStage(stageId);
    audioService.playSound('select');
    socketService.selectStage(stageId);
  };
  
  const handleStartGame = () => {
    // The actual game start is triggered by the server
    // This just lets the server know we want to start
    socketService.joinLobby(username);
  };
  
  // Check if the current user is the host (first player)
  const isHost = players.length > 0 && 
                socketService.getSocketId() === players[0].id;
  
  return (
    <Container>
      <Header>
        <Logo>React Smash Fighter</Logo>
        <LogoutButton onClick={onLogout}>Logout</LogoutButton>
      </Header>
      
      <ContentContainer>
        <TabsContainer>
          <Tab 
            $active={activeTab === 'character'} 
            onClick={() => setActiveTab('character')}
          >
            Select Character
          </Tab>
          <Tab 
            $active={activeTab === 'lobby'} 
            onClick={() => setActiveTab('lobby')}
          >
            Game Lobby
          </Tab>
        </TabsContainer>
        
        <TabContent>
          {activeTab === 'character' ? (
            <CharacterSelect 
              characters={characters}
              selectedCharacter={selectedCharacter}
              onSelectCharacter={handleSelectCharacter}
            />
          ) : (
            <Lobby 
              players={players}
              stages={stages}
              roomId={roomId}
              selectedStage={selectedStage}
              onSelectStage={handleSelectStage}
              onStartGame={handleStartGame}
              isHost={isHost}
            />
          )}
        </TabContent>
      </ContentContainer>
    </Container>
  );
};

export default LobbyScreen;
