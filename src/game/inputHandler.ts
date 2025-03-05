/**
 * Handles keyboard input for the game
 */
export class InputHandler {
  private keyState: Record<string, boolean> = {};
  private keyMap: Record<string, string> = {
    'KeyW': 'w',
    'KeyA': 'a',
    'KeyS': 's',
    'KeyD': 'd',
    'Space': 'space',
    'KeyJ': 'j',
    'KeyK': 'k',
  };
  
  constructor() {
    this.setupEventListeners();
  }
  
  private setupEventListeners() {
    // Handle key down events
    window.addEventListener('keydown', (event) => {
      const key = this.keyMap[event.code];
      if (key) {
        this.keyState[key] = true;
      }
    });
    
    // Handle key up events
    window.addEventListener('keyup', (event) => {
      const key = this.keyMap[event.code];
      if (key) {
        this.keyState[key] = false;
      }
    });
    
    // Handle window blur to reset all keys
    window.addEventListener('blur', () => {
      this.resetKeys();
    });
  }
  
  /**
   * Gets the current state of all keys
   * @returns Object with key states
   */
  getInput(): Record<string, boolean> {
    return { ...this.keyState };
  }
  
  /**
   * Resets all keys to not pressed
   */
  resetKeys() {
    for (const key in this.keyState) {
      this.keyState[key] = false;
    }
  }
  
  /**
   * Checks if a specific key is currently pressed
   * @param key The key to check
   * @returns boolean indicating pressed state
   */
  isKeyPressed(key: string): boolean {
    return this.keyState[key] || false;
  }
}

export default new InputHandler();
