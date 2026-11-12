import { describe, expect, it } from 'vitest';
import { formatUptime } from './format-uptime';

// Unit: a pure function, table-driven, no DOM and no network.
describe('formatUptime', () => {
  it.each([
    [0, '0s'],
    [59, '59s'],
    [60, '1m 0s'],
    [3600, '1h 0m 0s'],
    [3725, '1h 2m 5s'],
    [12.9, '12s'],
  ])('formats %s seconds as "%s"', (input, expected) => {
    expect(formatUptime(input)).toBe(expected);
  });

  it.each([-5, Number.NaN, Number.POSITIVE_INFINITY])(
    'treats invalid input %s as 0s',
    (input) => {
      expect(formatUptime(input)).toBe('0s');
    },
  );
});
