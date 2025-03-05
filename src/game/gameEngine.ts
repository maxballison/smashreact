import { Player, GameState, StageData } from '../types';
import physicsEngine from './physics';
import inputHandler from './inputHandler';
import socketService from '../services/socketService';

export class GameEngine {
  private players: Player[] = [];
  private localPlayerId: string | null = null;
  private gameState: Partial<GameState> = {};
  private stage: StageData | null = null;
  private lastUpdateTime: number = 0;
  private running: boolean = false;
  private pendingInputs: { sequence: number; input: Record<string, boolean> }[] = [];
  
  // Rendering callback
  private renderCallback: ((players: Player[], stage: StageData | null) => void) | null = null;
  
  constructor() {
    this.lastUpdateTime = performance.now();
  }
  
  /**
   * Initializes the game engine with a stage and local player ID
   */
  init(state: GameState, localPlayerId: string) {
    console.log("Game engine initializing with state:", {
      localPlayerId,
      playerCount: state.players.length,
      stage: state.stage
    });
    
    // Ensure we have valid players data
    if (!state.players || state.players.length === 0) {
      console.error("Cannot initialize game engine: No players provided");
      return;
    }
    
    // Store game state
    this.players = [...state.players]; // Clone to avoid reference issues
    this.localPlayerId = localPlayerId;
    this.gameState = state;
    this.running = true;
    this.lastUpdateTime = performance.now();
    
    console.log("Game engine initialized with players:", this.players);
    
    // Force-start the game loop
    if (this.running) {
      console.log("Starting game loop");
      // Use setTimeout to ensure the game engine is fully initialized first
      setTimeout(() => this.gameLoop(), 100);
    }
  }
  
  /**
   * Sets the render callback function
   */
  setRenderCallback(callback: (players: Player[], stage: StageData | null) => void) {
    this.renderCallback = callback;
  }
  
  /**
   * Sets the current stage
   */
  setStage(stage: StageData) {
    this.stage = stage;
    physicsEngine.setStage(stage);
  }
  
  /**
   * Updates the game state with server updates
   */
  handleServerUpdate(data: { players: Player[], timestamp: number }) {
    // Update all other players
    data.players.forEach(serverPlayer => {
      if (serverPlayer.id !== this.localPlayerId) {
        // Find and update the player in our local state
        const playerIndex = this.players.findIndex(p => p.id === serverPlayer.id);
        if (playerIndex !== -1) {
          this.players[playerIndex] = serverPlayer;
        } else {
          this.players.push(serverPlayer);
        }
      } else {
        // Handle server reconciliation for local player
        const playerIndex = this.players.findIndex(p => p.id === this.localPlayerId);
        if (playerIndex !== -1) {
          // Get the local player
          const localPlayer = this.players[playerIndex];
          
          // The server position becomes the authoritative position
          localPlayer.position = serverPlayer.position;
          localPlayer.stocks = serverPlayer.stocks;
          localPlayer.damage = serverPlayer.damage;
          
          // Find the last acknowledged input
          const lastProcessedInput = serverPlayer.lastProcessedInput || 0;
          
          // Remove older inputs that have been processed by the server
          this.pendingInputs = this.pendingInputs.filter(input => 
            input.sequence > lastProcessedInput
          );
          
          // Re-apply pending inputs to our local player
          let reprocessedPlayer = { ...localPlayer };
          
          for (const pendingInput of this.pendingInputs) {
            // Calculate small delta time for each input (16ms is roughly 60fps)
            reprocessedPlayer = physicsEngine.updatePlayerPhysics(
              reprocessedPlayer,
              0.016,
              pendingInput.input,
              this.stage?.platforms || []
            );
          }
          
          // Update the local player with reprocessed state
          this.players[playerIndex] = reprocessedPlayer;
        }
      }
    });
  }
  
  /**
   * Handles local player input
   */
  handleInput() {
    if (!this.localPlayerId) return;
    
    // Get the current input state
    const input = inputHandler.getInput();
    
    // Find the local player
    const playerIndex = this.players.findIndex(p => p.id === this.localPlayerId);
    if (playerIndex === -1) return;
    
    // Send input to server
    const sequence = socketService.sendInput(input);
    
    // Store the input for client-side prediction
    this.pendingInputs.push({ sequence, input });
    
    // Update the local player with the new input
    const localPlayer = this.players[playerIndex];
    const platforms = this.stage?.platforms || [];
    
    // Calculate deltaTime (16ms is roughly 60fps)
    const updatedPlayer = physicsEngine.updatePlayerPhysics(
      localPlayer,
      0.016,
      input,
      platforms
    );
    
    // Update the local player
    this.players[playerIndex] = updatedPlayer;
  }
  
  /**
   * Process attacks and collisions between players
   */
  processAttacks() {
    // For each attacking player
    for (let i = 0; i < this.players.length; i++) {
      const attacker = this.players[i];
      if (attacker.isAttacking) {
        // Check hits against all other players
        for (let j = 0; j < this.players.length; j++) {
          if (i !== j) {
            const defender = this.players[j];
            // Update defender if hit
            this.players[j] = physicsEngine.processAttack(attacker, defender);
          }
        }
      }
    }
  }
  
  /**
   * Main game loop
   */
  private gameLoop() {
    if (!this.running) {
      console.warn("Game loop called but game is not running");
      return;
    }
    
    // Calculate delta time
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // convert to seconds
    this.lastUpdateTime = currentTime;
    
    console.log("Game loop running, players:", this.players.length, "deltaTime:", deltaTime.toFixed(4));
    
    // Handle input for local player
    this.handleInput();
    
    // Process attacks (only for client-side prediction)
    if (this.localPlayerId) {
      this.processAttacks();
    }
    
    // Render the game state
    if (this.renderCallback) {
      console.log("Calling render callback with", this.players.length, "players");
      this.renderCallback(this.players, this.stage);
    } else {
      console.error("No render callback set!");
    }
    
    // Continue the game loop
    if (this.running) {
      requestAnimationFrame(() => this.gameLoop());
    }
  }
  
  /**
   * Stops the game engine
   */
  stop() {
    this.running = false;
  }
  
  /**
   * Get the current game state
   */
  getGameState() {
    return {
      players: this.players,
      stage: this.stage,
    };
  }
}

export default new GameEngine();
