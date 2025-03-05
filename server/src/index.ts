import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Game state storage
interface Player {
  id: string;
  username: string;
  character: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  direction: number; // 1 for right, -1 for left
  isJumping: boolean;
  isAttacking: boolean;
  attackType: string | null;
  health: number;
  damage: number;
  stocks: number;
  lastInput: Record<string, boolean>;
  lastProcessedInput: number;
}

interface GameRoom {
  id: string;
  players: Map<string, Player>;
  stage: string;
  isActive: boolean;
  startTime: number;
  gameTime: number; // in seconds
  maxPlayers: number;
  stockCount: number;
  timeLimit: number; // in seconds
  lastUpdateTime: number;
}

// Store active game rooms
const gameRooms = new Map<string, GameRoom>();

// Handle socket connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Handle player joining lobbies
  socket.on('join_lobby', ({ username }) => {
    // Create or find available lobby
    let gameRoom: GameRoom | undefined;
    
    // Find an existing room that's not full or active
    for (const [roomId, room] of gameRooms.entries()) {
      if (!room.isActive && room.players.size < room.maxPlayers) {
        gameRoom = room;
        break;
      }
    }
    
    // Create a new room if none available
    if (!gameRoom) {
      const roomId = uuidv4();
      gameRoom = {
        id: roomId,
        players: new Map(),
        stage: 'battlefield', // Default stage
        isActive: false,
        startTime: 0,
        gameTime: 0,
        maxPlayers: 4,
        stockCount: 3,
        timeLimit: 180, // 3 minutes
        lastUpdateTime: Date.now(),
      };
      gameRooms.set(roomId, gameRoom);
    }
    
    // Create player
    const player: Player = {
      id: socket.id,
      username,
      character: 'default', // Default character
      position: { x: 400, y: 300 },
      velocity: { x: 0, y: 0 },
      direction: 1,
      isJumping: false,
      isAttacking: false,
      attackType: null,
      health: 0,
      damage: 0,
      stocks: gameRoom.stockCount,
      lastInput: {},
      lastProcessedInput: 0,
    };
    
    // Add player to room
    gameRoom.players.set(socket.id, player);
    
    // Join socket room
    socket.join(gameRoom.id);
    
    // Notify room of new player
    const playersArray = Array.from(gameRoom.players.values());
    io.to(gameRoom.id).emit('lobby_update', {
      roomId: gameRoom.id,
      players: playersArray,
      stage: gameRoom.stage,
      stockCount: gameRoom.stockCount,
      timeLimit: gameRoom.timeLimit,
    });
    
    // Start game if room is full
    if (gameRoom.players.size >= 2) {
      setTimeout(() => {
        if (gameRooms.has(gameRoom!.id) && gameRoom!.players.size >= 2) {
          startGame(gameRoom!);
        }
      }, 3000); // 3 second delay before starting
    }
  });
  
  // Handle player input
  socket.on('player_input', ({ input, sequence }) => {
    // Find player's game room
    let playerRoom: GameRoom | undefined;
    
    for (const [roomId, room] of gameRooms.entries()) {
      if (room.players.has(socket.id)) {
        playerRoom = room;
        break;
      }
    }
    
    if (!playerRoom) return;
    
    const player = playerRoom.players.get(socket.id);
    if (!player) return;
    
    // Update player's last input
    player.lastInput = input;
    player.lastProcessedInput = sequence;
    
    // Broadcast input to other players in room
    socket.to(playerRoom.id).emit('player_input', {
      playerId: socket.id,
      input,
      sequence,
    });
  });
  
  // Handle player selecting character
  socket.on('select_character', ({ character }) => {
    // Find player's game room
    for (const [roomId, room] of gameRooms.entries()) {
      if (room.players.has(socket.id)) {
        const player = room.players.get(socket.id);
        if (player) {
          player.character = character;
          
          // Notify room of character selection
          const playersArray = Array.from(room.players.values());
          io.to(roomId).emit('lobby_update', {
            roomId,
            players: playersArray,
            stage: room.stage,
            stockCount: room.stockCount,
            timeLimit: room.timeLimit,
          });
        }
        break;
      }
    }
  });
  
  // Handle player selecting stage
  socket.on('select_stage', ({ stage }) => {
    // Find player's game room
    for (const [roomId, room] of gameRooms.entries()) {
      if (room.players.has(socket.id)) {
        room.stage = stage;
        
        // Notify room of stage selection
        const playersArray = Array.from(room.players.values());
        io.to(roomId).emit('lobby_update', {
          roomId,
          players: playersArray,
          stage: room.stage,
          stockCount: room.stockCount,
          timeLimit: room.timeLimit,
        });
        break;
      }
    }
  });
  
  // Handle player disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove player from their game room
    for (const [roomId, room] of gameRooms.entries()) {
      if (room.players.has(socket.id)) {
        room.players.delete(socket.id);
        
        // Notify room of player leaving
        const playersArray = Array.from(room.players.values());
        io.to(roomId).emit('lobby_update', {
          roomId,
          players: playersArray,
          stage: room.stage,
          stockCount: room.stockCount,
          timeLimit: room.timeLimit,
        });
        
        // If room is empty, remove it
        if (room.players.size === 0) {
          gameRooms.delete(roomId);
        }
        // If game is active and only one player remains, end the game
        else if (room.isActive && room.players.size === 1) {
          endGame(room);
        }
        break;
      }
    }
  });
});

// Start a game room
function startGame(gameRoom: GameRoom) {
  gameRoom.isActive = true;
  gameRoom.startTime = Date.now();
  gameRoom.lastUpdateTime = Date.now();
  
  // Randomize starting positions
  let startX = 200;
  for (const [playerId, player] of gameRoom.players.entries()) {
    player.position = { x: startX, y: 100 };
    player.velocity = { x: 0, y: 0 };
    player.damage = 0;
    player.stocks = gameRoom.stockCount;
    startX += 200; // Space players apart
  }
  
  // Notify players that game is starting
  const playersArray = Array.from(gameRoom.players.values());
  io.to(gameRoom.id).emit('game_start', {
    roomId: gameRoom.id,
    players: playersArray,
    stage: gameRoom.stage,
    stockCount: gameRoom.stockCount,
    timeLimit: gameRoom.timeLimit,
  });
  
  // Start game update loop
  const gameLoopInterval = setInterval(() => {
    // Check if room still exists
    if (!gameRooms.has(gameRoom.id)) {
      clearInterval(gameLoopInterval);
      return;
    }
    
    // Update game state
    updateGameState(gameRoom);
    
    // Check for game end conditions
    const currentTime = Date.now();
    const elapsedTime = Math.floor((currentTime - gameRoom.startTime) / 1000);
    
    if (elapsedTime >= gameRoom.timeLimit) {
      endGame(gameRoom);
      clearInterval(gameLoopInterval);
    }
    
    // Count players with stocks left
    let playersWithStocks = 0;
    let lastPlayerWithStocks: Player | null = null;
    
    for (const [playerId, player] of gameRoom.players.entries()) {
      if (player.stocks > 0) {
        playersWithStocks++;
        lastPlayerWithStocks = player;
      }
    }
    
    // If only one player has stocks left, end the game
    if (playersWithStocks <= 1 && gameRoom.players.size > 1) {
      endGame(gameRoom);
      clearInterval(gameLoopInterval);
    }
  }, 16); // ~60 FPS
}

// Update game state
function updateGameState(gameRoom: GameRoom) {
  const currentTime = Date.now();
  const deltaTime = (currentTime - gameRoom.lastUpdateTime) / 1000; // in seconds
  gameRoom.lastUpdateTime = currentTime;
  
  // Update player positions based on inputs and physics
  for (const [playerId, player] of gameRoom.players.entries()) {
    // Apply gravity
    player.velocity.y += 980 * deltaTime; // Gravity constant
    
    // Process player inputs
    if (player.lastInput) {
      // Horizontal movement
      if (player.lastInput.a && !player.lastInput.d) {
        player.velocity.x = -400; // Move left
        player.direction = -1;
      } else if (player.lastInput.d && !player.lastInput.a) {
        player.velocity.x = 400; // Move right
        player.direction = 1;
      } else {
        // Apply friction
        player.velocity.x *= 0.9;
      }
      
      // Jumping
      if (player.lastInput.space && !player.isJumping) {
        player.velocity.y = -600; // Jump force
        player.isJumping = true;
      }
      
      // Attacks
      if (player.lastInput.j) {
        player.isAttacking = true;
        player.attackType = 'light';
        // Reset attack after short delay
        setTimeout(() => {
          if (gameRoom.players.has(playerId)) {
            const p = gameRoom.players.get(playerId);
            if (p) {
              p.isAttacking = false;
              p.attackType = null;
            }
          }
        }, 200);
      } else if (player.lastInput.k) {
        player.isAttacking = true;
        player.attackType = 'heavy';
        // Reset attack after longer delay
        setTimeout(() => {
          if (gameRoom.players.has(playerId)) {
            const p = gameRoom.players.get(playerId);
            if (p) {
              p.isAttacking = false;
              p.attackType = null;
            }
          }
        }, 500);
      }
    }
    
    // Update position
    player.position.x += player.velocity.x * deltaTime;
    player.position.y += player.velocity.y * deltaTime;
    
    // Simple platform collision (assuming platform at y=500)
    if (player.position.y > 500) {
      player.position.y = 500;
      player.velocity.y = 0;
      player.isJumping = false;
    }
    
    // Stage boundaries
    if (player.position.x < 0) player.position.x = 0;
    if (player.position.x > 1200) player.position.x = 1200;
    
    // Check if player fell off stage
    if (player.position.y > 800) {
      player.stocks--;
      if (player.stocks > 0) {
        // Respawn player
        player.position = { x: 600, y: 100 };
        player.velocity = { x: 0, y: 0 };
        player.damage = 0;
      }
    }
  }
  
  // Check for attacks and collisions
  for (const [attackerId, attacker] of gameRoom.players.entries()) {
    if (attacker.isAttacking) {
      for (const [defenderId, defender] of gameRoom.players.entries()) {
        if (attackerId !== defenderId) {
          // Simple hitbox collision
          const attackRange = attacker.attackType === 'heavy' ? 100 : 60;
          const dx = defender.position.x - attacker.position.x;
          const dy = defender.position.y - attacker.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Check if within attack range and in correct direction
          const correctDirection = (attacker.direction === 1 && dx > 0) || 
                                   (attacker.direction === -1 && dx < 0);
          
          if (distance < attackRange && correctDirection) {
            // Calculate damage and knockback
            const baseDamage = attacker.attackType === 'heavy' ? 15 : 5;
            const knockbackMultiplier = 1 + (defender.damage / 100);
            
            // Apply damage
            defender.damage += baseDamage;
            
            // Apply knockback
            const knockbackForce = attacker.attackType === 'heavy' ? 500 : 200;
            defender.velocity.x = attacker.direction * knockbackForce * knockbackMultiplier;
            defender.velocity.y = -300 * knockbackMultiplier;
          }
        }
      }
    }
  }
  
  // Send updated game state to all players
  const playersArray = Array.from(gameRoom.players.values());
  io.to(gameRoom.id).emit('game_update', {
    players: playersArray,
    timestamp: currentTime,
  });
}

// End a game
function endGame(gameRoom: GameRoom) {
  gameRoom.isActive = false;
  
  // Calculate results
  const results = Array.from(gameRoom.players.entries()).map(([id, player]) => ({
    id,
    username: player.username,
    character: player.character,
    stocks: player.stocks,
    damage: player.damage,
  }));
  
  // Sort by stocks remaining (descending) and then damage (ascending)
  results.sort((a, b) => {
    if (a.stocks !== b.stocks) return b.stocks - a.stocks;
    return a.damage - b.damage;
  });
  
  // Send results to all players
  io.to(gameRoom.id).emit('game_end', { results });
  
  // Reset room or remove it
  setTimeout(() => {
    if (gameRooms.has(gameRoom.id)) {
      const room = gameRooms.get(gameRoom.id);
      if (room && room.players.size > 0) {
        // Reset for next game
        for (const [playerId, player] of room.players.entries()) {
          player.damage = 0;
          player.stocks = room.stockCount;
          player.position = { x: 400, y: 300 };
          player.velocity = { x: 0, y: 0 };
        }
      } else {
        // Remove empty room
        gameRooms.delete(gameRoom.id);
      }
    }
  }, 10000); // 10 seconds after game end
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
