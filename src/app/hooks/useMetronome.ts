import { useEffect, useRef } from 'react';

export type MetronomeSound = 'click' | 'beep' | 'woodblock' | 'cowbell' | 'snap';

export function useMetronome(
  bpm: number, 
  isPlaying: boolean, 
  volume: number, 
  isMuted: boolean,
  soundType: MetronomeSound = 'click'
) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize audio context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const playClick = () => {
      if (!audioContextRef.current || isMuted) return;

      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      const now = context.currentTime;

      // Different sound types
      switch (soundType) {
        case 'click':
          // Short, sharp click sound
          oscillator.frequency.value = 1000;
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(volume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
          oscillator.start(now);
          oscillator.stop(now + 0.05);
          break;

        case 'beep':
          // Electronic beep
          oscillator.frequency.value = 800;
          oscillator.type = 'square';
          gainNode.gain.setValueAtTime(volume * 0.3, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          oscillator.start(now);
          oscillator.stop(now + 0.1);
          break;

        case 'woodblock':
          // Wood block sound (multiple frequencies)
          oscillator.frequency.value = 1200;
          oscillator.type = 'triangle';
          gainNode.gain.setValueAtTime(volume * 0.5, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
          oscillator.start(now);
          oscillator.stop(now + 0.08);
          break;

        case 'cowbell':
          // Cowbell sound (metallic)
          oscillator.frequency.value = 587;
          oscillator.type = 'square';
          gainNode.gain.setValueAtTime(volume * 0.4, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          oscillator.start(now);
          oscillator.stop(now + 0.15);
          break;

        case 'snap':
          // Finger snap sound
          oscillator.frequency.value = 2000;
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(volume * 0.6, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
          oscillator.start(now);
          oscillator.stop(now + 0.03);
          break;
      }
    };

    if (isPlaying) {
      // Calculate interval in milliseconds from BPM
      const interval = (60 / bpm) * 1000;

      // Play immediately on start
      playClick();

      // Set up interval for subsequent clicks
      intervalRef.current = setInterval(playClick, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [bpm, isPlaying, volume, isMuted, soundType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);
}