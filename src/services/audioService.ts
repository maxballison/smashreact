/**
 * Manages all game audio including sound effects and music
 */
class AudioService {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private music: Map<string, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.7;
  private currentMusic: string | null = null;
  
  constructor() {
    this.preloadSounds();
  }
  
  /**
   * Preload all game audio assets
   */
  preloadSounds() {
    // Sound effects
    this.registerSound('hit_light', '/assets/audio/hit_light.mp3');
    this.registerSound('hit_heavy', '/assets/audio/hit_heavy.mp3');
    this.registerSound('jump', '/assets/audio/jump.mp3');
    this.registerSound('death', '/assets/audio/death.mp3');
    this.registerSound('select', '/assets/audio/select.mp3');
    this.registerSound('match_start', '/assets/audio/match_start.mp3');
    this.registerSound('match_end', '/assets/audio/match_end.mp3');
    
    // Music
    this.registerMusic('menu', '/assets/audio/menu_music.mp3');
    this.registerMusic('battle', '/assets/audio/battle_music.mp3');
    this.registerMusic('results', '/assets/audio/results_music.mp3');
  }
  
  /**
   * Register a sound effect
   */
  registerSound(name: string, path: string) {
    const sound = new Audio(path);
    sound.volume = this.sfxVolume;
    this.sounds.set(name, sound);
  }
  
  /**
   * Register background music
   */
  registerMusic(name: string, path: string) {
    const music = new Audio(path);
    music.volume = this.musicVolume;
    music.loop = true;
    this.music.set(name, music);
  }
  
  /**
   * Play a sound effect
   */
  playSound(name: string) {
    if (this.isMuted) return;
    
    const sound = this.sounds.get(name);
    if (sound) {
      // Create a clone to allow overlapping sounds
      const soundClone = sound.cloneNode() as HTMLAudioElement;
      soundClone.volume = this.sfxVolume;
      soundClone.play().catch(e => console.warn('Error playing sound:', e));
    }
  }
  
  /**
   * Play background music
   */
  playMusic(name: string) {
    if (this.currentMusic === name) return;
    
    // Stop current music if playing
    this.stopMusic();
    
    const music = this.music.get(name);
    if (music && !this.isMuted) {
      music.currentTime = 0;
      music.play().catch(e => console.warn('Error playing music:', e));
      this.currentMusic = name;
    }
  }
  
  /**
   * Stop all currently playing music
   */
  stopMusic() {
    if (this.currentMusic) {
      const music = this.music.get(this.currentMusic);
      if (music) {
        music.pause();
        music.currentTime = 0;
      }
      this.currentMusic = null;
    }
  }
  
  /**
   * Toggle mute status for all audio
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    // Update all sound volumes
    this.sounds.forEach(sound => {
      sound.volume = this.isMuted ? 0 : this.sfxVolume;
    });
    
    // Update all music volumes
    this.music.forEach(music => {
      music.volume = this.isMuted ? 0 : this.musicVolume;
    });
    
    // If unmuting and there was music playing, restart it
    if (!this.isMuted && this.currentMusic) {
      const music = this.music.get(this.currentMusic);
      if (music) {
        music.play().catch(e => console.warn('Error playing music:', e));
      }
    } else {
      // Stop all music if muting
      this.stopMusic();
    }
    
    return this.isMuted;
  }
  
  /**
   * Set the volume for sound effects
   */
  setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    
    if (!this.isMuted) {
      this.sounds.forEach(sound => {
        sound.volume = this.sfxVolume;
      });
    }
  }
  
  /**
   * Set the volume for music
   */
  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    
    if (!this.isMuted && this.currentMusic) {
      const music = this.music.get(this.currentMusic);
      if (music) {
        music.volume = this.musicVolume;
      }
    }
  }
  
  /**
   * Get current mute status
   */
  getMuteStatus() {
    return this.isMuted;
  }
  
  /**
   * Get current SFX volume
   */
  getSfxVolume() {
    return this.sfxVolume;
  }
  
  /**
   * Get current music volume
   */
  getMusicVolume() {
    return this.musicVolume;
  }
}

export default new AudioService();
