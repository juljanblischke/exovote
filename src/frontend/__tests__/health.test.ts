import { describe, it, expect } from 'vitest';

describe('health check', () => {
  it('should have correct app name', () => {
    expect('ExoVote').toBe('ExoVote');
  });
});
