import { useEffect, useRef, useState } from 'react';

export const useCountdown = (initialSeconds: number, isActive: boolean) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const reset = () => setSeconds(initialSeconds);

  return { seconds, reset };
};
