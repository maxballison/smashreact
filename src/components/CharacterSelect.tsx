import React from 'react';
import styled from 'styled-components';
import { CharacterData } from '../types';

interface CharacterSelectProps {
  characters: CharacterData[];
  selectedCharacter: string;
  onSelectCharacter: (character: string) => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #fff;
  text-align: center;
  margin-bottom: 30px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
`;

const CharacterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  width: 100%;
`;

const CharacterCard = styled.div<{ selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 3px solid ${props => props.selected ? '#ffcc00' : 'transparent'};
  box-shadow: ${props => props.selected ? '0 0 15px #ffcc00' : '0 0 10px rgba(0, 0, 0, 0.3)'};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.selected ? '0 0 20px #ffcc00' : '0 0 15px rgba(255, 255, 255, 0.3)'};
  }
`;

const CharacterImage = styled.div`
  width: 100px;
  height: 100px;
  background-color: #333;
  border-radius: 50%;
  margin-bottom: 10px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CharacterName = styled.div`
  font-size: 1.2rem;
  color: #fff;
  text-align: center;
`;

const CharacterStats = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 10px;
`;

const StatBar = styled.div<{ value: number }>`
  height: 5px;
  background-color: #444;
  border-radius: 2px;
  width: 100%;
  margin-top: 2px;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.value}%;
    background-color: #ffcc00;
    border-radius: 2px;
  }
`;

const StatGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 0 2px;
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  color: #aaa;
  text-align: center;
`;

const CharacterSelect: React.FC<CharacterSelectProps> = ({
  characters,
  selectedCharacter,
  onSelectCharacter,
}) => {
  return (
    <Container>
      <Title>Select Your Character</Title>
      
      <CharacterGrid>
        {characters.map(character => (
          <CharacterCard 
            key={character.id}
            selected={selectedCharacter === character.id}
            onClick={() => onSelectCharacter(character.id)}
          >
            <CharacterImage>
              {character.sprite && (
                <img src={character.sprite} alt={character.name} />
              )}
            </CharacterImage>
            
            <CharacterName>{character.name}</CharacterName>
            
            <CharacterStats>
              <StatGroup>
                <StatLabel>SPD</StatLabel>
                <StatBar value={(character.stats.speed / 10) * 100} />
              </StatGroup>
              
              <StatGroup>
                <StatLabel>PWR</StatLabel>
                <StatBar value={(character.stats.attackPower / 10) * 100} />
              </StatGroup>
              
              <StatGroup>
                <StatLabel>JMP</StatLabel>
                <StatBar value={(character.stats.jumpHeight / 10) * 100} />
              </StatGroup>
            </CharacterStats>
          </CharacterCard>
        ))}
      </CharacterGrid>
    </Container>
  );
};

export default CharacterSelect;
