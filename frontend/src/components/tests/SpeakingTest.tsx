import { useEffect, useState } from 'react';
import { Button } from '@components/ui/Button';
import { TestQuestion } from '@types/index';
import { audioService } from '@services/audioService';

interface SpeakingTestProps {
  question: TestQuestion;
  onSubmit: (audio: Blob, responseTime: number) => Promise<void>;
}

export const SpeakingTest = ({ question, onSubmit }: SpeakingTestProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    audioService.requestPermission().catch(() => {
      // permission denied; rely on submit handling
    });
  }, []);

  const startRecording = async () => {
    await audioService.startRecording();
    setIsRecording(true);
    setElapsedSeconds(0);
    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    setTimer(interval);
  };

  const stopRecording = async () => {
    const blob = await audioService.stopRecording();
    if (timer) {
      window.clearInterval(timer);
      setTimer(null);
    }
    setAudioBlob(blob);
    setIsRecording(false);
  };

  const handlePlayback = async () => {
    if (audioBlob) {
      await audioService.playBlob(audioBlob);
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob) return;
    await onSubmit(audioBlob, elapsedSeconds);
    setAudioBlob(null);
    setElapsedSeconds(0);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        {question.question_text}
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-600">Recording time: {elapsedSeconds}s</p>
        <div className="flex flex-wrap gap-3">
          {!isRecording ? (
            <Button type="button" onClick={startRecording}>
              Start Recording
            </Button>
          ) : (
            <Button type="button" variant="danger" onClick={stopRecording}>
              Stop Recording
            </Button>
          )}
          {audioBlob && (
            <>
              <Button type="button" variant="secondary" onClick={handlePlayback}>
                Play Recording
              </Button>
              <Button type="button" variant="ghost" onClick={() => setAudioBlob(null)}>
                Re-record
              </Button>
            </>
          )}
        </div>
        <Button type="button" onClick={handleSubmit} disabled={!audioBlob}>
          Submit Response
        </Button>
      </div>
    </div>
  );
};
