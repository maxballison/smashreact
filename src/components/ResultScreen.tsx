import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

interface PlayerResult {
  id: string;
  username: string;
  character: string;
  stocks: number;
  damage: number;
}

interface ResultScreenProps {
  results: PlayerResult[];
  onReturn: () => void;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
`;

const Title = styled.h2`
  font-size: 3rem;
  margin-bottom: 30px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 3px;
  animation: ${fadeIn} 0.5s ease-out forwards;
`;

const ResultsContainer = styled.div`
  width: 100%;
  max-width: 800px;
  animation: ${fadeIn} 0.5s ease-out forwards;
  animation-delay: 0.3s;
  opacity: 0;
`;

const PlayerRow = styled.div<{ isWinner: boolean }>`
  display: flex;
  align-items: center;
  background-color: ${props => props.isWinner ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 10px;
  padding: 15px 20px;
  margin-bottom: 15px;
  border: ${props => props.isWinner ? '2px solid gold' : 'none'};
  box-shadow: ${props => props.isWinner ? '0 0 15px rgba(255, 215, 0, 0.5)' : 'none'};
`;

const Position = styled.div<{ position: number }>`
  font-size: 2rem;
  font-weight: bold;
  margin-right: 20px;
  color: ${props => {
    if (props.position === 1) return 'gold';
    if (props.position === 2) return 'silver';
    if (props.position === 3) return '#cd7f32'; // bronze
    return 'white';
  }};
`;

const PlayerAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #333;
  margin-right: 20px;
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
  font-size: 1.5rem;
  font-weight: bold;
`;

const CharacterName = styled.div`
  font-size: 1rem;
  opacity: 0.7;
`;

const Stats = styled.div`
  display: flex;
  align-items: center;
`;

const Stat = styled.div`
  margin-left: 20px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  opacity: 0.7;
  text-transform: uppercase;
`;

const ReturnButton = styled.button`
  background: linear-gradient(135deg, #4a90e2, #2563eb);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 15px 30px;
  font-size: 1.2rem;
  margin-top: 30px;
  cursor: pointer;
  transition: all 0.2s;
  animation: ${fadeIn} 0.5s ease-out forwards;
  animation-delay: 0.6s;
  opacity: 0;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(37, 99, 235, 0.5);
  }
`;

const ResultScreen: React.FC<ResultScreenProps> = ({ results, onReturn }) => {
  const [showButton, setShowButton] = useState(false);
  
  // Sort results by stocks (descending) and then damage (ascending)
  const sortedResults = [...results].sort((a, b) => {
    if (a.stocks !== b.stocks) return b.stocks - a.stocks;
    return a.damage - b.damage;
  });
  
  // Show return button after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Container>
      <Title>Match Results</Title>
      
      <ResultsContainer>
        {sortedResults.map((player, index) => (
          <PlayerRow key={player.id} isWinner={index === 0}>
            <Position position={index + 1}>{index + 1}</Position>
            
            <PlayerAvatar>
              {/* Character image would go here */}
            </PlayerAvatar>
            
            <PlayerInfo>
              <PlayerName>{player.username}</PlayerName>
              <CharacterName>{player.character}</CharacterName>
            </PlayerInfo>
            
            <Stats>
              <Stat>
                <StatValue>{player.stocks}</StatValue>
                <StatLabel>Stocks</StatLabel>
              </Stat>
              
              <Stat>
                <StatValue>{player.damage}%</StatValue>
                <StatLabel>Damage</StatLabel>
              </Stat>
            </Stats>
          </PlayerRow>
        ))}
      </ResultsContainer>
      
      {showButton && (
        <ReturnButton onClick={onReturn}>
          Return to Lobby
        </ReturnButton>
      )}
    </Container>
  );
};

export default ResultScreen;
