import { Player, StageData } from '../types';

export class Renderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private width: number = 0;
  private height: number = 0;
  private scale: number = 1;
  private images: Record<string, HTMLImageElement> = {};
  private animations: Record<string, { frames: string[], currentFrame: number, frameTime: number, lastFrameTime: number }> = {};
  private screenShake: { active: boolean, duration: number, intensity: number, startTime: number } = { 
    active: false, duration: 0, intensity: 0, startTime: 0 
  };
  private hitEffects: { x: number, y: number, size: number, duration: number, startTime: number }[] = [];
  
  /**
   * Initialize the renderer with a canvas element
   */
  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    if (!this.ctx) {
      console.error("Failed to get 2D context from canvas");
      return;
    }
    
    // Store initial canvas dimensions
    this.width = canvas.width;
    this.height = canvas.height;
    
    console.log("Renderer initializing with canvas dimensions:", this.width, "x", this.height);
    
    // Force an initial test render to ensure the renderer is working
    this.drawTestPattern();
    
    // Set up responsive canvas
    this.handleResize();
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // We'll use fallbacks instead of trying to load assets that don't exist yet
    // this.preloadAssets();
    
    console.log("Renderer initialization complete");
  }
  
  /**
   * Draw a test pattern to verify renderer is working
   */
  private drawTestPattern() {
    if (!this.ctx || !this.canvas) {
      console.error("Cannot draw test pattern - context or canvas is null");
      return;
    }
    
    console.log("Drawing test pattern on canvas");
    
    // Clear canvas with light blue
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw a grid
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < this.canvas.width; x += 80) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < this.canvas.height; y += 80) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
    
    // Draw text
    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = '#000000';
    this.ctx.fillText('Renderer Test Pattern', 20, 40);
    this.ctx.fillText(`Canvas size: ${this.canvas.width} x ${this.canvas.height}`, 20, 70);
  }
  
  /**
   * Handle window resize to maintain aspect ratio
   */
  private handleResize() {
    if (!this.canvas) {
      console.error("Cannot resize - canvas is null");
      return;
    }
    
    const container = this.canvas.parentElement;
    if (!container) {
      console.error("Cannot resize - canvas parent element is null");
      return;
    }
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    console.log("Resizing canvas to fit container:", containerWidth, "x", containerHeight);
    
    // Maintain 16:9 aspect ratio
    const aspectRatio = 16 / 9;
    let newWidth, newHeight;
    
    if (containerWidth / containerHeight > aspectRatio) {
      // Container is wider than needed
      newHeight = containerHeight;
      newWidth = newHeight * aspectRatio;
    } else {
      // Container is taller than needed
      newWidth = containerWidth;
      newHeight = newWidth / aspectRatio;
    }
    
    // Update the CSS dimensions
    this.canvas.style.width = `${newWidth}px`;
    this.canvas.style.height = `${newHeight}px`;
    
    // Don't change the internal resolution - this is important
    // The actual pixel dimensions should stay the same
    this.canvas.width = 1280;
    this.canvas.height = 720;
    
    // Update internal dimensions
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    // Calculate scale for input handling
    this.scale = 1280 / newWidth;
    
    console.log("Canvas resized:", {
      cssWidth: newWidth,
      cssHeight: newHeight,
      internalWidth: this.width,
      internalHeight: this.height,
      scale: this.scale
    });
    
    // Re-draw test pattern to verify resize worked
    this.drawTestPattern();
  }
  
  /**
   * Preload game assets - commented out for now since we're using fallbacks
   */
  /*
  private preloadAssets() {
    // Load character sprites
    this.loadImage('character1_idle', '/assets/characters/character1/idle.png');
    this.loadImage('character1_run', '/assets/characters/character1/run.png');
    this.loadImage('character1_jump', '/assets/characters/character1/jump.png');
    this.loadImage('character1_attack1', '/assets/characters/character1/attack1.png');
    this.loadImage('character1_attack2', '/assets/characters/character1/attack2.png');
    
    // Load character 2 sprites
    this.loadImage('character2_idle', '/assets/characters/character2/idle.png');
    this.loadImage('character2_run', '/assets/characters/character2/run.png');
    this.loadImage('character2_jump', '/assets/characters/character2/jump.png');
    this.loadImage('character2_attack1', '/assets/characters/character2/attack1.png');
    this.loadImage('character2_attack2', '/assets/characters/character2/attack2.png');
    
    // Load stage assets
    this.loadImage('stage_battlefield', '/assets/stages/battlefield.png');
    this.loadImage('stage_final_destination', '/assets/stages/final_destination.png');
    
    // Load effect assets
    this.loadImage('effect_hit', '/assets/effects/hit.png');
    this.loadImage('effect_smoke', '/assets/effects/smoke.png');
  }
  */
  
  /**
   * Load an image asset
   */
  private loadImage(key: string, src: string) {
    const img = new Image();
    img.src = src;
    this.images[key] = img;
  }
  
  /**
   * Render the game
   */
  render(players: Player[], stage: StageData | null) {
    if (!this.ctx || !this.canvas) {
      console.error("Cannot render - no context or canvas");
      return;
    }
    
    // Get canvas dimensions directly from the element to be sure
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    
    console.log("Rendering game frame:", {
      canvasWidth,
      canvasHeight,
      playerCount: players?.length || 0
    });
    
    // Always clear the canvas first
    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw background regardless of stage data
    this.drawBackground(canvasWidth, canvasHeight);
    
    // Apply screen shake if active
    if (this.screenShake.active) {
      const elapsed = performance.now() - this.screenShake.startTime;
      if (elapsed < this.screenShake.duration) {
        const intensity = this.screenShake.intensity * (1 - elapsed / this.screenShake.duration);
        const shakeX = (Math.random() * 2 - 1) * intensity;
        const shakeY = (Math.random() * 2 - 1) * intensity;
        this.ctx.save();
        this.ctx.translate(shakeX, shakeY);
      } else {
        this.screenShake.active = false;
      }
    }
    
    // Draw stage platforms
    if (stage && stage.platforms) {
      this.drawPlatforms(stage.platforms);
    } else {
      // Draw default platform if no stage data
      this.drawDefaultPlatforms(canvasWidth, canvasHeight);
    }
    
    // Draw players if available
    if (players && players.length > 0) {
      for (const player of players) {
        this.drawPlayer(player);
        this.drawDamageIndicator(player);
      }
    } else {
      // Draw placeholder players if no player data
      this.drawPlaceholderPlayers(canvasWidth, canvasHeight);
    }
    
    // Draw hit effects
    this.drawHitEffects();
    
    // Reset screen shake
    if (this.screenShake.active) {
      this.ctx.restore();
    }
  }
  
  /**
   * Draw the background (sky, clouds, etc)
   */
  private drawBackground(width: number, height: number) {
    if (!this.ctx) return;
    
    // Sky blue gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue at top
    gradient.addColorStop(1, '#4682B4'); // Steel blue at bottom
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
    
    // Draw some clouds
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.beginPath();
    this.ctx.ellipse(200, 100, 80, 40, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.ellipse(400, 150, 100, 50, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.ellipse(700, 120, 90, 45, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.ellipse(1000, 180, 70, 35, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  /**
   * Draw default platforms when no stage data is available
   */
  private drawDefaultPlatforms(width: number, height: number) {
    if (!this.ctx) return;
    
    // Main platform
    const mainPlatform = {
      x: width * 0.2,
      y: height * 0.7,
      width: width * 0.6,
      height: 20
    };
    
    // Draw main platform
    this.ctx.fillStyle = '#654321'; // Brown
    this.ctx.fillRect(mainPlatform.x, mainPlatform.y, mainPlatform.width, mainPlatform.height);
    
    // Platform top (grass)
    this.ctx.fillStyle = '#228B22'; // Forest Green
    this.ctx.fillRect(mainPlatform.x, mainPlatform.y, mainPlatform.width, 5);
    
    // Smaller platforms
    const smallPlatform1 = {
      x: width * 0.3,
      y: height * 0.5,
      width: width * 0.15,
      height: 15
    };
    
    const smallPlatform2 = {
      x: width * 0.55,
      y: height * 0.5,
      width: width * 0.15,
      height: 15
    };
    
    // Draw smaller platforms
    this.ctx.fillStyle = '#654321'; // Brown
    this.ctx.fillRect(smallPlatform1.x, smallPlatform1.y, smallPlatform1.width, smallPlatform1.height);
    this.ctx.fillRect(smallPlatform2.x, smallPlatform2.y, smallPlatform2.width, smallPlatform2.height);
    
    // Platform tops (grass)
    this.ctx.fillStyle = '#228B22'; // Forest Green
    this.ctx.fillRect(smallPlatform1.x, smallPlatform1.y, smallPlatform1.width, 3);
    this.ctx.fillRect(smallPlatform2.x, smallPlatform2.y, smallPlatform2.width, 3);
  }
  
  /**
   * Draw placeholder players when no player data is available
   */
  private drawPlaceholderPlayers(width: number, height: number) {
    if (!this.ctx) return;
    
    // Player 1 position (left side)
    const player1X = width * 0.3;
    const player1Y = height * 0.6;
    
    // Player 2 position (right side)
    const player2X = width * 0.7;
    const player2Y = height * 0.6;
    
    // Draw Player 1 (red)
    this.drawPlaceholderPlayer(player1X, player1Y, '#ff0000', 1);
    
    // Draw Player 2 (blue)
    this.drawPlaceholderPlayer(player2X, player2Y, '#0000ff', -1);
    
    // Add helper text
    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Player 1', player1X, player1Y - 80);
    this.ctx.fillText('Player 2', player2X, player2Y - 80);
  }
  
  /**
   * Draw a single placeholder player
   */
  private drawPlaceholderPlayer(x: number, y: number, color: string, direction: number) {
    if (!this.ctx) return;
    
    this.ctx.save();
    
    // Apply flip based on direction
    if (direction === -1) {
      this.ctx.translate(x, y);
      this.ctx.scale(-1, 1);
      this.ctx.translate(-x, -y);
    }
    
    // Body
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x - 20, y - 40, 40, 60);
    
    // Head
    this.ctx.beginPath();
    this.ctx.arc(x, y - 60, 20, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Eyes
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.ellipse(x + 8, y - 65, 5, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#000000';
    this.ctx.beginPath();
    this.ctx.arc(x + 8, y - 63, 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Arms
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x - 30, y - 20, 10, 30);
    this.ctx.fillRect(x + 20, y - 20, 10, 30);
    
    // Legs
    this.ctx.fillRect(x - 15, y + 20, 10, 30);
    this.ctx.fillRect(x + 5, y + 20, 10, 30);
    
    this.ctx.restore();
  }
  
  /**
   * Draw the stage background
   */
  private drawStage(stage: StageData | null) {
    if (!this.ctx) return;
    
    // Always use the fallback for now
    // Sky blue gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue at top
    gradient.addColorStop(1, '#4682B4'); // Steel blue at bottom
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw some clouds
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.beginPath();
    this.ctx.ellipse(200, 100, 80, 40, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.ellipse(400, 150, 100, 50, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.ellipse(700, 120, 90, 45, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.ellipse(1000, 180, 70, 35, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  /**
   * Draw stage platforms
   */
  private drawPlatforms(platforms: { x: number; y: number; width: number; height: number }[]) {
    if (!this.ctx) return;
    
    for (const platform of platforms) {
      // Platform base
      this.ctx.fillStyle = '#654321'; // Brown
      this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      
      // Platform top (grass)
      this.ctx.fillStyle = '#228B22'; // Forest Green
      this.ctx.fillRect(platform.x, platform.y, platform.width, 5);
      
      // Platform edges
      this.ctx.fillStyle = '#8B4513'; // Saddle Brown
      this.ctx.fillRect(platform.x, platform.y, 5, platform.height);
      this.ctx.fillRect(platform.x + platform.width - 5, platform.y, 5, platform.height);
    }
  }
  
  /**
   * Draw a player character
   */
  private drawPlayer(player: Player) {
    if (!this.ctx) return;
    
    // Get character color based on player ID or character
    const characterColors: Record<string, string> = {
      'fighter': '#ff0000', // Red
      'ninja': '#0000ff',   // Blue
      'brute': '#00ff00',   // Green
      'mage': '#ff00ff'     // Purple
    };
    
    const color = characterColors[player.character] || 
                 (player.id === 'player1' ? '#ff0000' : '#0000ff');
    
    // Draw character
    this.ctx.fillStyle = color;
    
    // Draw a more detailed character
    this.ctx.save();
    
    // Position for the character center
    const x = player.position.x;
    const y = player.position.y;
    
    // Apply flip based on direction
    if (player.direction === -1) {
      this.ctx.translate(x, y);
      this.ctx.scale(-1, 1);
      this.ctx.translate(-x, -y);
    }
    
    // Body
    this.ctx.fillRect(x - 20, y - 40, 40, 60);
    
    // Head
    this.ctx.beginPath();
    this.ctx.arc(x, y - 60, 20, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Eyes
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.ellipse(x + 8, y - 65, 5, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#000000';
    this.ctx.beginPath();
    this.ctx.arc(x + 8, y - 63, 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw limbs based on state
    this.ctx.fillStyle = color;
    
    if (player.isAttacking) {
      // Attack pose - extended arm
      this.ctx.fillRect(x + 20, y - 30, 40, 10);
      
      // Show attack effect
      if (player.attackType === 'heavy') {
        this.ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
        this.ctx.beginPath();
        this.ctx.arc(x + 65, y - 25, 15, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.beginPath();
        this.ctx.arc(x + 55, y - 25, 10, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // Other arm
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x - 10, y - 20, 10, 30);
      
    } else if (player.isJumping) {
      // Jump pose - arms up
      this.ctx.fillRect(x - 40, y - 45, 30, 10);
      this.ctx.fillRect(x + 10, y - 45, 30, 10);
      
      // Legs bent
      this.ctx.fillRect(x - 15, y + 20, 10, 20);
      this.ctx.fillRect(x + 5, y + 20, 10, 20);
      
    } else if (Math.abs(player.velocity.x) > 50) {
      // Running pose
      // Arms in motion
      this.ctx.fillRect(x - 35, y - 30, 30, 10);
      this.ctx.fillRect(x + 5, y - 20, 30, 10);
      
      // Legs in motion
      this.ctx.fillRect(x - 15, y + 20, 10, 25);
      this.ctx.fillRect(x + 5, y + 20, 10, 25);
      
    } else {
      // Idle pose
      // Arms down
      this.ctx.fillRect(x - 30, y - 20, 10, 30);
      this.ctx.fillRect(x + 20, y - 20, 10, 30);
      
      // Legs
      this.ctx.fillRect(x - 15, y + 20, 10, 30);
      this.ctx.fillRect(x + 5, y + 20, 10, 30);
    }
    
    this.ctx.restore();
  }
  
  /**
   * Draw player damage indicator
   */
  private drawDamageIndicator(player: Player) {
    if (!this.ctx) return;
    
    // Position below the player
    const x = player.position.x;
    const y = player.position.y + 60;
    
    // Draw background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.beginPath();
    this.ctx.roundRect(x - 40, y, 80, 30, 5);
    this.ctx.fill();
    
    // Draw percentage
    this.ctx.fillStyle = player.damage > 100 ? '#ff0000' : '#ffffff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(`${Math.floor(player.damage)}%`, x, y + 15);
    
    // Draw stock indicators
    for (let i = 0; i < player.stocks; i++) {
      this.ctx.fillStyle = '#00ff00';
      this.ctx.beginPath();
      this.ctx.arc(x - 25 + (i * 15), y + 30, 5, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  /**
   * Draw hit effects
   */
  private drawHitEffects() {
    if (!this.ctx) return;
    
    const currentTime = performance.now();
    const remainingEffects = [];
    
    for (const effect of this.hitEffects) {
      const elapsed = currentTime - effect.startTime;
      if (elapsed < effect.duration) {
        // Calculate opacity based on remaining time
        const opacity = 1 - (elapsed / effect.duration);
        const size = effect.size * (1 + elapsed / effect.duration); // Expand effect
        
        // Draw hit effect
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        
        // Always use the fallback
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
        remainingEffects.push(effect);
      }
    }
    
    this.hitEffects = remainingEffects;
  }
  
  /**
   * Trigger screen shake effect
   */
  triggerScreenShake(intensity: number, duration: number) {
    this.screenShake = {
      active: true,
      intensity,
      duration,
      startTime: performance.now()
    };
  }
  
  /**
   * Add a hit effect
   */
  addHitEffect(x: number, y: number, size: number = 100, duration: number = 300) {
    this.hitEffects.push({
      x,
      y,
      size,
      duration,
      startTime: performance.now()
    });
  }
}

export default new Renderer();
