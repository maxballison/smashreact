import { io, Socket } from 'socket.io-client';
import { Player, GameState } from '../types';

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

  connect(serverUrl: string) {
    this.socket = io(serverUrl);

    this.socket.on('connect', () => {
      console.log('Connected to server');
      if (this.handlers.onConnect) this.handlers.onConnect();
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      if (this.handlers.onDisconnect) this.handlers.onDisconnect();
    });

    this.socket.on('lobby_update', (data) => {
      if (this.handlers.onLobbyUpdate) this.handlers.onLobbyUpdate(data);
    });

    this.socket.on('game_start', (data) => {
      if (this.handlers.onGameStart) this.handlers.onGameStart(data);
    });

    this.socket.on('game_update', (data) => {
      if (this.handlers.onGameUpdate) this.handlers.onGameUpdate(data);
    });

    this.socket.on('player_input', (data) => {
      if (this.handlers.onPlayerInput) this.handlers.onPlayerInput(data);
    });

    this.socket.on('game_end', (data) => {
      if (this.handlers.onGameEnd) this.handlers.onGameEnd(data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinLobby(username: string) {
    if (this.socket) {
      this.socket.emit('join_lobby', { username });
    }
  }

  selectCharacter(character: string) {
    if (this.socket) {
      this.socket.emit('select_character', { character });
    }
  }

  selectStage(stage: string) {
    if (this.socket) {
      this.socket.emit('select_stage', { stage });
    }
  }

  sendInput(input: Record<string, boolean>) {
    if (this.socket) {
      this.inputSequence++;
      this.socket.emit('player_input', { input, sequence: this.inputSequence });
      return this.inputSequence;
    }
    return 0;
  }

  getSocketId(): string | null {
    if (!this.socket) return null;
    return this.socket.id || null;
  }

  // Event handlers
  setOnConnect(callback: () => void) {
    this.handlers.onConnect = callback;
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

export default new SocketService();
