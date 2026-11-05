import { formatKg } from './format';

describe('formatKg', () => {
  it.each([
    [22, '22'],
    [0, '0'],
    [2.25, '2,3'],
    [2.24, '2,2'],
    [1.96, '2'],
    [0.04, '0'],
    [1234.5, '1234,5'],
  ])('%p → %p', (kg, expected) => {
    expect(formatKg(kg)).toBe(expected);
  });
});
