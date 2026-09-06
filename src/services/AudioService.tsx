// Serviço de áudio simplificado SEM expo-av
class AudioService {
  private audioElement: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;

  async playBackgroundMusic(volume: number = 0.3) {
    try {
      // Só funciona na web
      if (typeof window === 'undefined') {
        console.log('Áudio disponível apenas na versão web');
        return;
      }

      if (this.isPlaying) return;

      // Criar elemento de áudio
      this.audioElement = new Audio();
      
      // Usar música online (não precisa de arquivo local)
      this.audioElement.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      this.audioElement.loop = true;
      this.audioElement.volume = volume;
      
      // Tocar
      await this.audioElement.play();
      this.isPlaying = true;
      console.log('🎵 Música iniciada (Web)');
      
    } catch (error) {
      console.log('⚠️ Erro ao tocar música:', error);
    }
  }

  async stopBackgroundMusic() {
    try {
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.audioElement = null;
        this.isPlaying = false;
        console.log('🔇 Música parada');
      }
    } catch (error) {
      console.log('Erro ao parar música:', error);
    }
  }

  async setVolume(volume: number) {
    try {
      if (this.audioElement) {
        this.audioElement.volume = volume;
      }
    } catch (error) {
      console.log('Erro ao ajustar volume:', error);
    }
  }
}

export default new AudioService();