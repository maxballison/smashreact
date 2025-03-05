import { Player, Vector2D, StageData } from '../types';

// Physics constants
const GRAVITY = 980; // pixels per second squared
const TERMINAL_VELOCITY = 1000; // max falling speed
const FRICTION = 0.9; // horizontal friction
const FLOOR_Y = 500; // default floor height

export class PhysicsEngine {
  private stage: StageData | null = null;

  setStage(stage: StageData) {
    this.stage = stage;
  }

  /**
   * Updates player physics
   * @param player The player to update
   * @param deltaTime Time since last update in seconds
   * @param input Current player input state
   * @returns Updated player object
   */
  updatePlayerPhysics(
    player: Player, 
    deltaTime: number, 
    input: Record<string, boolean> = {},
    platforms: { x: number; y: number; width: number; height: number }[]
  ): Player {
    const updatedPlayer = { ...player };
    
    // Apply gravity
    updatedPlayer.velocity.y += GRAVITY * deltaTime;
    
    // Cap terminal velocity
    if (updatedPlayer.velocity.y > TERMINAL_VELOCITY) {
      updatedPlayer.velocity.y = TERMINAL_VELOCITY;
    }
    
    // Process horizontal movement
    if (input.a && !input.d) {
      // Move left
      updatedPlayer.velocity.x = -400;
      updatedPlayer.direction = -1;
    } else if (input.d && !input.a) {
      // Move right
      updatedPlayer.velocity.x = 400;
      updatedPlayer.direction = 1;
    } else {
      // Apply friction when no horizontal input
      updatedPlayer.velocity.x *= FRICTION;
    }
    
    // Process jump
    if (input.space && !updatedPlayer.isJumping) {
      updatedPlayer.velocity.y = -600;
      updatedPlayer.isJumping = true;
    }
    
    // Process attack inputs
    if (input.j && !updatedPlayer.isAttacking) {
      updatedPlayer.isAttacking = true;
      updatedPlayer.attackType = 'light';
    } else if (input.k && !updatedPlayer.isAttacking) {
      updatedPlayer.isAttacking = true;
      updatedPlayer.attackType = 'heavy';
    }
    
    // Update position based on velocity
    const newPosition = {
      x: updatedPlayer.position.x + updatedPlayer.velocity.x * deltaTime,
      y: updatedPlayer.position.y + updatedPlayer.velocity.y * deltaTime
    };
    
    // Check platform collisions
    let onPlatform = false;
    
    // First check if player is falling
    const isFalling = updatedPlayer.velocity.y > 0;
    
    if (isFalling) {
      // Check each platform for collision
      for (const platform of platforms) {
        // Check if player was above platform in previous frame
        const wasAbovePlatform = player.position.y + 40 <= platform.y; // 40 is player height/2
        
        // Check if player is now below or at platform level
        const isAtPlatformLevel = newPosition.y + 40 >= platform.y;
        
        // Check if player is horizontally within platform bounds
        const isHorizontallyAligned = 
          newPosition.x + 30 > platform.x && // 30 is player width/2
          newPosition.x - 30 < platform.x + platform.width;
        
        // If all conditions are met, snap to platform
        if (wasAbovePlatform && isAtPlatformLevel && isHorizontallyAligned) {
          newPosition.y = platform.y - 40; // Snap to platform
          updatedPlayer.velocity.y = 0;
          updatedPlayer.isJumping = false;
          onPlatform = true;
          break;
        }
      }
    }
    
    // Check stage boundaries if stage is set
    if (this.stage) {
      if (newPosition.x < this.stage.bounds.left) {
        newPosition.x = this.stage.bounds.left;
        updatedPlayer.velocity.x = 0;
      } else if (newPosition.x > this.stage.bounds.right) {
        newPosition.x = this.stage.bounds.right;
        updatedPlayer.velocity.x = 0;
      }
      
      // Check top boundary
      if (newPosition.y < this.stage.bounds.top) {
        newPosition.y = this.stage.bounds.top;
        updatedPlayer.velocity.y = 0;
      }
      
      // Check if fallen off stage
      if (newPosition.y > this.stage.bounds.bottom) {
        // Player has fallen off, handle stock reduction in game logic
        updatedPlayer.stocks -= 1;
        if (updatedPlayer.stocks > 0) {
          // Respawn
          newPosition.x = (this.stage.bounds.left + this.stage.bounds.right) / 2;
          newPosition.y = this.stage.bounds.top + 100;
          updatedPlayer.velocity = { x: 0, y: 0 };
          updatedPlayer.damage = 0;
          updatedPlayer.isJumping = false;
          updatedPlayer.isAttacking = false;
          updatedPlayer.attackType = null;
        }
      }
    } else {
      // Fallback floor collision if no stage is set
      if (newPosition.y > FLOOR_Y) {
        newPosition.y = FLOOR_Y;
        updatedPlayer.velocity.y = 0;
        updatedPlayer.isJumping = false;
      }
    }
    
    // Apply the new position
    updatedPlayer.position = newPosition;
    
    return updatedPlayer;
  }
  
  /**
   * Checks for attacks and processes hit detection
   * @param attacker The attacking player
   * @param defender The defending player
   * @returns Updated defender with damage and knockback applied if hit
   */
  processAttack(attacker: Player, defender: Player): Player {
    if (!attacker.isAttacking || attacker.id === defender.id) {
      return defender;
    }
    
    const updatedDefender = { ...defender };
    
    // Define attack ranges based on attack type
    const attackRange = attacker.attackType === 'heavy' ? 100 : 60;
    
    // Calculate distance between players
    const dx = defender.position.x - attacker.position.x;
    const dy = defender.position.y - attacker.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if attack hits (in range and correct direction)
    const correctDirection = (attacker.direction === 1 && dx > 0) || 
                             (attacker.direction === -1 && dx < 0);
    
    if (distance < attackRange && correctDirection) {
      // Calculate damage based on attack type
      const baseDamage = attacker.attackType === 'heavy' ? 15 : 5;
      
      // Apply damage
      updatedDefender.damage += baseDamage;
      
      // Calculate knockback based on defender's damage percentage
      const knockbackMultiplier = 1 + (updatedDefender.damage / 100);
      
      // Apply knockback
      const knockbackForce = attacker.attackType === 'heavy' ? 500 : 200;
      updatedDefender.velocity.x = attacker.direction * knockbackForce * knockbackMultiplier;
      updatedDefender.velocity.y = -300 * knockbackMultiplier;
      
      // Set defender as in the air
      updatedDefender.isJumping = true;
    }
    
    return updatedDefender;
  }
}

export default new PhysicsEngine();
