import { describe, it, expect } from 'vitest';
import { exportWAV } from './wav.js';

describe('WAV Export', () => {
  it('should export AudioBuffer to WAV Blob', () => {
    // Create mock AudioBuffer
    const sampleRate = 44100;
    const length = 1000;
    const mockBuffer = {
      numberOfChannels: 1,
      length: length,
      sampleRate: sampleRate,
      getChannelData: (channel) => {
        const data = new Float32Array(length);
        for (let i = 0; i < length; i++) {
          data[i] = Math.sin(i / 10) * 0.5;
        }
        return data;
      }
    };

    const blob = exportWAV(mockBuffer);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('audio/wav');
    expect(blob.size).toBeGreaterThan(0);

    // WAV header is 44 bytes + data
    // Each sample is 2 bytes (16-bit), mono
    const expectedSize = 44 + (length * 2);
    expect(blob.size).toBe(expectedSize);
  });

  it('should handle stereo audio', () => {
    const sampleRate = 44100;
    const length = 1000;
    const mockBuffer = {
      numberOfChannels: 2,
      length: length,
      sampleRate: sampleRate,
      getChannelData: (channel) => {
        const data = new Float32Array(length);
        for (let i = 0; i < length; i++) {
          data[i] = Math.sin(i / 10) * 0.5;
        }
        return data;
      }
    };

    const blob = exportWAV(mockBuffer);

    expect(blob).toBeInstanceOf(Blob);
    // Stereo: 2 channels * 2 bytes per sample
    const expectedSize = 44 + (length * 2 * 2);
    expect(blob.size).toBe(expectedSize);
  });
});
