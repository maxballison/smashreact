import React from 'react';
import styled from 'styled-components';
import { Player } from '../types';

interface GameHUDProps {
  players: Player[];
  timeRemaining: number;
  isPaused: boolean;
}

const HUDContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  z-index: 10;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
`;

const TimeDisplay = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  padding: 5px 15px;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
`;

const PlayerInfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 20px;
`;

const PlayerInfo = styled.div<{ alignment: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  flex-direction: ${props => props.alignment === 'left' ? 'row' : 'row-reverse'};
  margin-bottom: 10px;
`;

const PlayerName = styled.div<{ alignment: 'left' | 'right' }>`
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-weight: bold;
  padding: 5px 10px;
  border-radius: ${props => props.alignment === 'left' ? '0 5px 5px 0' : '5px 0 0 5px'};
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DamageDisplay = styled.div<{ damage: number }>`
  background-color: ${props => {
    if (props.damage < 50) return 'rgba(0, 150, 0, 0.8)';
    if (props.damage < 100) return 'rgba(255, 165, 0, 0.8)';
    return 'rgba(200, 0, 0, 0.8)';
  }};
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  padding: 5px 15px;
  border-radius: 5px;
  margin: 0 10px;
  min-width: 70px;
  text-align: center;
`;

const StockDisplay = styled.div<{ alignment: 'left' | 'right' }>`
  display: flex;
  flex-direction: row;
  ${props => props.alignment === 'right' && 'flex-direction: row-reverse;'}
`;

const StockIcon = styled.div`
  width: 25px;
  height: 25px;
  background-color: red;
  border-radius: 50%;
  margin: 0 2px;
`;

const PauseOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const PauseText = styled.div`
  color: white;
  font-size: 3rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 5px;
`;

const GameHUD: React.FC<GameHUDProps> = ({ players, timeRemaining, isPaused }) => {
  // Format time as MM:SS
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  // Sort players into left and right sides (max 4 players)
  const leftPlayers = players.slice(0, 2);
  const rightPlayers = players.slice(2);
  
  return (
    <HUDContainer>
      <TopBar>
        <div />
        <TimeDisplay>{formattedTime}</TimeDisplay>
        <div />
      </TopBar>
      
      <PlayerInfoContainer>
        <div>
          {leftPlayers.map((player, index) => (
            <PlayerInfo key={player.id} alignment="left">
              <PlayerName alignment="left">{player.username}</PlayerName>
              <DamageDisplay damage={player.damage}>
                {Math.floor(player.damage)}%
              </DamageDisplay>
              <StockDisplay alignment="left">
                {Array.from({ length: player.stocks }).map((_, i) => (
                  <StockIcon key={i} />
                ))}
              </StockDisplay>
            </PlayerInfo>
          ))}
        </div>
        
        <div>
          {rightPlayers.map((player, index) => (
            <PlayerInfo key={player.id} alignment="right">
              <PlayerName alignment="right">{player.username}</PlayerName>
              <DamageDisplay damage={player.damage}>
                {Math.floor(player.damage)}%
              </DamageDisplay>
              <StockDisplay alignment="right">
                {Array.from({ length: player.stocks }).map((_, i) => (
                  <StockIcon key={i} />
                ))}
              </StockDisplay>
            </PlayerInfo>
          ))}
        </div>
      </PlayerInfoContainer>
      
      {isPaused && (
        <PauseOverlay>
          <PauseText>PAUSED</PauseText>
        </PauseOverlay>
      )}
    </HUDContainer>
  );
};

export default GameHUD;
