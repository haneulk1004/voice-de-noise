# Testing Guide

## Test Files Created

The following test files have been created for unit testing:

### 1. `src/audio/analysis.test.js`
Tests for loudness analysis and gain calculation functions:
- `measureLoudness()` - LUFS calculation
- `calculateGainNeeded()` - Gain calculation with safety clamping

### 2. `src/utils/wav.test.js`
Tests for WAV export functionality:
- Mono audio export
- Stereo audio export
- WAV header validation

## Running Tests

### Manual Testing Checklist

Until the automated test environment is fully configured, use this manual testing checklist:

#### File Processing
- [ ] Upload a WAV file (mono/stereo, various sample rates)
- [ ] Verify progress bar updates smoothly
- [ ] Check that denoise intensity slider works (0-100%)
- [ ] Verify EQ slider affects clarity (0-10 dB)
- [ ] Test different LUFS targets (-24, -16, -14)
- [ ] Download processed file and verify it plays correctly

#### Mode Presets
- [ ] Select "Dialogue" preset - verify EQ=5, Intensity=85%
- [ ] Select "Gentle" preset - verify EQ=2, Intensity=50%
- [ ] Select "Surgical" preset - verify EQ=8, Intensity=100%
- [ ] Manually adjust parameters - verify mode switches to "Custom"

#### Edge Cases
- [ ] Test with very short audio (< 1 second)
- [ ] Test with long audio (> 5 minutes)
- [ ] Test with different file formats (MP3, WAV, M4A)
- [ ] Test browser compatibility (Chrome, Firefox, Safari)

## Automated Testing (Future)

To set up automated tests:

```bash
npm install --save-dev vitest @vitest/ui jsdom
npm run test        # Run in watch mode
npm run test:ui     # Run with UI
npm run test:run    # Run once
```

Note: Currently experiencing configuration issues with Vitest 4.x. May need to downgrade to v3 or adjust config.
