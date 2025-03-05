import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

interface LoginProps {
  onLogin: (username: string) => void;
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
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
`;

const Logo = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: white;
  margin-bottom: 40px;
  text-transform: uppercase;
  letter-spacing: 3px;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
  animation: ${fadeIn} 0.5s ease-out forwards;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
  background-color: rgba(30, 30, 30, 0.8);
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.5s ease-out forwards;
  animation-delay: 0.2s;
  opacity: 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px;
  border-radius: 5px;
  border: none;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  margin-bottom: 20px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    background-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 15px;
  border-radius: 5px;
  border: none;
  background: linear-gradient(135deg, #ff9900, #ff5500);
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 85, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
  
  &:disabled {
    background: linear-gradient(135deg, #777, #555);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  margin-bottom: 15px;
  font-size: 0.9rem;
  text-align: center;
`;

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate username
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    if (username.length > 15) {
      setError('Username must be less than 15 characters');
      return;
    }
    
    // Clear any errors
    setError('');
    
    // Call login handler
    onLogin(username);
  };
  
  return (
    <Container>
      <Logo>React Smash Fighter</Logo>
      
      <Form onSubmit={handleSubmit}>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        
        <Button type="submit" disabled={!username.trim()}>
          Enter Game
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
