export class AudioService {
  private mediaRecorder?: MediaRecorder;
  private chunks: BlobPart[] = [];

  async requestPermission() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  }

  async startRecording(onData?: (stream: MediaStream) => void) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (onData) {
      onData(stream);
    }
    this.mediaRecorder = new MediaRecorder(stream);
    this.chunks = [];

    return new Promise<MediaRecorder>((resolve) => {
      this.mediaRecorder?.addEventListener('dataavailable', (event) => {
        this.chunks.push(event.data);
      });

      this.mediaRecorder?.addEventListener('stop', () => {
        stream.getTracks().forEach((track) => track.stop());
      });

      this.mediaRecorder?.start();
      resolve(this.mediaRecorder!);
    });
  }

  stopRecording() {
    return new Promise<Blob>((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.addEventListener('stop', () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        resolve(blob);
      });

      this.mediaRecorder.stop();
    });
  }

  async playBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    await audio.play();
  }
}

export const audioService = new AudioService();
