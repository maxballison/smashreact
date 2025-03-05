import React, { useState } from 'react';
import styled from 'styled-components';
import { Player, StageData } from '../types';

interface LobbyProps {
  players: Player[];
  stages: StageData[];
  roomId: string;
  selectedStage: string;
  onSelectStage: (stageId: string) => void;
  onStartGame: () => void;
  isHost: boolean;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  color: white;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 2rem;
  margin: 0;
`;

const RoomCode = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px 15px;
  border-radius: 5px;
  font-family: monospace;
  font-size: 1.2rem;
  
  span {
    margin-right: 10px;
    opacity: 0.7;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PlayerList = styled.div`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  padding: 20px;
`;

const PlayerCard = styled.div`
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
`;

const PlayerAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #333;
  margin-right: 15px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlayerInfo = styled.div`
  flex: 1;
`;

const PlayerName = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
`;

const CharacterName = styled.div`
  font-size: 0.9rem;
  opacity: 0.7;
`;

const StagesContainer = styled.div`
  flex: 1;
`;

const StagesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
`;

const StageCard = styled.div<{ selected: boolean }>`
  overflow: hidden;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: ${props => props.selected ? '0 0 15px #ffcc00' : '0 0 10px rgba(0, 0, 0, 0.3)'};
  border: 3px solid ${props => props.selected ? '#ffcc00' : 'transparent'};
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const StageImage = styled.div`
  height: 100px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const StageName = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px;
  text-align: center;
  font-weight: bold;
`;

const StartButton = styled.button`
  background: linear-gradient(135deg, #ff9900, #ff5500);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 15px 30px;
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 20px;
  cursor: pointer;
  transition: all 0.2s;
  align-self: center;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(255, 153, 0, 0.5);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #777, #555);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SectionTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
`;

const Lobby: React.FC<LobbyProps> = ({
  players,
  stages,
  roomId,
  selectedStage,
  onSelectStage,
  onStartGame,
  isHost,
}) => {
  const canStartGame = players.length >= 2;
  
  return (
    <Container>
      <Header>
        <Title>Game Lobby</Title>
        <RoomCode>
          <span>Room Code:</span>
          {roomId}
        </RoomCode>
      </Header>
      
      <ContentContainer>
        <PlayerList>
          <SectionTitle>Players ({players.length}/4)</SectionTitle>
          
          {players.map(player => (
            <PlayerCard key={player.id}>
              <PlayerAvatar>
                {/* If we had character images, they'd go here */}
              </PlayerAvatar>
              <PlayerInfo>
                <PlayerName>{player.username}</PlayerName>
                <CharacterName>
                  {player.character === 'default' ? 'Selecting...' : player.character}
                </CharacterName>
              </PlayerInfo>
            </PlayerCard>
          ))}
        </PlayerList>
        
        <StagesContainer>
          <SectionTitle>Select Stage</SectionTitle>
          
          <StagesList>
            {stages.map(stage => (
              <StageCard 
                key={stage.id}
                selected={selectedStage === stage.id}
                onClick={() => onSelectStage(stage.id)}
              >
                <StageImage>
                  {stage.background && (
                    <img src={stage.background} alt={stage.name} />
                  )}
                </StageImage>
                <StageName>{stage.name}</StageName>
              </StageCard>
            ))}
          </StagesList>
        </StagesContainer>
      </ContentContainer>
      
      {isHost && (
        <StartButton 
          onClick={onStartGame}
          disabled={!canStartGame}
        >
          {canStartGame ? 'Start Game' : 'Waiting for Players...'}
        </StartButton>
      )}
    </Container>
  );
};

export default Lobby;
