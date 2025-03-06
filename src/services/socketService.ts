import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private inputSequence = 0;
  private handlers: {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onLobbyUpdate?: (data: any) => void;
    onGameStart?: (data: any) => void;
    onGameUpdate?: (data: any) => void;
    onPlayerInput?: (data: any) => void;
    onGameEnd?: (data: any) => void;
  } = {};
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  connect(serverUrl: string) {
    console.log(`Connecting to socket server at ${serverUrl}`);
    
    // Don't create multiple connections
    if (this.socket) {
      console.log('Socket already exists, disconnecting first');
      this.disconnect();
    }

    try {
      this.socket = io(serverUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Error connecting to socket server:', error);
      // Fall back to local mode if we can't connect
      this.useFallbackMode();
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to server with ID:', this.socket?.id);
      this.connected = true;
      this.reconnectAttempts = 0;
      if (this.handlers.onConnect) this.handlers.onConnect();
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connected = false;
      if (this.handlers.onDisconnect) this.handlers.onDisconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('Max reconnection attempts reached, falling back to local mode');
        this.useFallbackMode();
      }
    });

    this.socket.on('lobby_update', (data) => {
      console.log('Received lobby update:', data);
      if (this.handlers.onLobbyUpdate) this.handlers.onLobbyUpdate(data);
    });

    this.socket.on('game_start', (data) => {
      console.log('Received game start:', data);
      if (this.handlers.onGameStart) this.handlers.onGameStart(data);
    });

    this.socket.on('game_update', (data) => {
      // Don't log every frame to avoid console spam
      if (this.handlers.onGameUpdate) this.handlers.onGameUpdate(data);
    });

    this.socket.on('player_input', (data) => {
      if (this.handlers.onPlayerInput) this.handlers.onPlayerInput(data);
    });

    this.socket.on('game_end', (data) => {
      console.log('Received game end:', data);
      if (this.handlers.onGameEnd) this.handlers.onGameEnd(data);
    });
  }

  /**
   * Fall back to local mode if server connection fails
   */
  private useFallbackMode() {
    console.log('Using fallback local mode');
    
    // Create a fake game with local player and a CPU opponent
    setTimeout(() => {
      if (this.handlers.onLobbyUpdate) {
        const localPlayerId = 'player1';
        
        // Simulate lobby update
        this.handlers.onLobbyUpdate({
          roomId: 'local-game',
          players: [
            {
              id: localPlayerId,
              username: 'You',
              character: 'fighter',
              position: { x: 400, y: 300 },
              velocity: { x: 0, y: 0 },
              direction: 1,
              isJumping: false,
              isAttacking: false,
              attackType: null,
              health: 0,
              damage: 0,
              stocks: 3
            },
            {
              id: 'cpu',
              username: 'CPU',
              character: 'ninja',
              position: { x: 800, y: 300 },
              velocity: { x: 0, y: 0 },
              direction: -1,
              isJumping: false,
              isAttacking: false,
              attackType: null,
              health: 0,
              damage: 0,
              stocks: 3
            }
          ],
          stage: 'battlefield',
          stockCount: 3,
          timeLimit: 180
        });
      }
      
      // Simulate game start after a short delay
      setTimeout(() => {
        if (this.handlers.onGameStart) {
          this.handlers.onGameStart({
            roomId: 'local-game',
            players: [
              {
                id: 'player1',
                username: 'You',
                character: 'fighter',
                position: { x: 400, y: 300 },
                velocity: { x: 0, y: 0 },
                direction: 1,
                isJumping: false,
                isAttacking: false,
                attackType: null,
                health: 0,
                damage: 0,
                stocks: 3
              },
              {
                id: 'cpu',
                username: 'CPU',
                character: 'ninja',
                position: { x: 800, y: 300 },
                velocity: { x: 0, y: 0 },
                direction: -1,
                isJumping: false,
                isAttacking: false,
                attackType: null,
                health: 0,
                damage: 0,
                stocks: 3
              }
            ],
            stage: 'battlefield',
            stockCount: 3,
            timeLimit: 180
          });
        }
      }, 2000);
    }, 1000);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  joinLobby(username: string) {
    if (this.socket && this.connected) {
      console.log('Joining lobby as', username);
      this.socket.emit('join_lobby', { username });
    } else {
      console.log('Cannot join lobby - not connected');
      this.useFallbackMode();
    }
  }

  selectCharacter(character: string) {
    if (this.socket && this.connected) {
      console.log('Selecting character:', character);
      this.socket.emit('select_character', { character });
    }
  }

  selectStage(stage: string) {
    if (this.socket && this.connected) {
      console.log('Selecting stage:', stage);
      this.socket.emit('select_stage', { stage });
    }
  }

  sendInput(input: Record<string, boolean>) {
    this.inputSequence++;
    
    if (this.socket && this.connected) {
      this.socket.emit('player_input', { input, sequence: this.inputSequence });
    }
    
    return this.inputSequence;
  }

  getSocketId(): string {
    if (this.socket && this.connected) {
      return this.socket.id || 'player1';
    }
    return 'player1'; // Default local ID
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Event handlers
  setOnConnect(callback: () => void) {
    this.handlers.onConnect = callback;
    
    // If already connected, call the callback
    if (this.socket && this.connected && callback) {
      callback();
    }
  }

  setOnDisconnect(callback: () => void) {
    this.handlers.onDisconnect = callback;
  }

  setOnLobbyUpdate(callback: (data: any) => void) {
    this.handlers.onLobbyUpdate = callback;
  }

  setOnGameStart(callback: (data: any) => void) {
    this.handlers.onGameStart = callback;
  }

  setOnGameUpdate(callback: (data: any) => void) {
    this.handlers.onGameUpdate = callback;
  }

  setOnPlayerInput(callback: (data: any) => void) {
    this.handlers.onPlayerInput = callback;
  }

  setOnGameEnd(callback: (data: any) => void) {
    this.handlers.onGameEnd = callback;
  }
}

// Create a singleton instance
const socketService = new SocketService();

// Export the instance as default
export default socketService;