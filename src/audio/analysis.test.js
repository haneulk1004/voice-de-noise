import { describe, it, expect } from 'vitest';
import { measureLoudness, calculateGainNeeded } from './analysis.js';

describe('Audio Analysis', () => {
  describe('measureLoudness', () => {
    it('should return low LUFS for silent audio', () => {
      // Create silent buffer
      const mockBuffer = {
        getChannelData: () => new Float32Array(1000).fill(0)
      };

      const lufs = measureLoudness(mockBuffer);
      expect(lufs).toBe(-100); // Should return -100 for silence
    });

    it('should calculate LUFS for audio with signal', () => {
      // Create buffer with some signal
      const data = new Float32Array(1000);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.sin(i / 10) * 0.1; // Small sine wave
      }

      const mockBuffer = {
        getChannelData: () => data
      };

      const lufs = measureLoudness(mockBuffer);
      expect(lufs).toBeLessThan(0); // Should be negative
      expect(lufs).toBeGreaterThan(-100); // But not silence
    });
  });

  describe('calculateGainNeeded', () => {
    it('should calculate positive gain when current is below target', () => {
      const currentLUFS = -30;
      const targetLUFS = -16;
      const gain = calculateGainNeeded(currentLUFS, targetLUFS);

      expect(gain).toBe(14); // -16 - (-30) = 14
    });

    it('should calculate negative gain when current is above target', () => {
      const currentLUFS = -10;
      const targetLUFS = -16;
      const gain = calculateGainNeeded(currentLUFS, targetLUFS);

      expect(gain).toBe(-6); // -16 - (-10) = -6
    });

    it('should clamp gain to +20dB maximum', () => {
      const currentLUFS = -50;
      const targetLUFS = -16;
      const gain = calculateGainNeeded(currentLUFS, targetLUFS);

      expect(gain).toBe(20); // Should be clamped to 20
    });

    it('should clamp gain to -20dB minimum', () => {
      const currentLUFS = 10;
      const targetLUFS = -16;
      const gain = calculateGainNeeded(currentLUFS, targetLUFS);

      expect(gain).toBe(-20); // Should be clamped to -20
    });
  });
});
