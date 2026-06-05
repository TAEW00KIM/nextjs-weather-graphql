import { formatTime, formatDate, formatDatetime } from '../../graphql/formatters';

// 2024-01-15 12:00:00 UTC
const DT = 1705320000;
const UTC = 0;
const KST = 32400;   // UTC+9 (Seoul)
const CET = 3600;    // UTC+1 (Paris winter)

describe('formatTime', () => {
  it('12:00 UTC returns 12:00pm', () => {
    expect(formatTime(DT, UTC)).toBe('12:00pm');
  });

  it('12:00 UTC in KST (UTC+9) returns 09:00pm', () => {
    expect(formatTime(DT, KST)).toBe('09:00pm');
  });

  it('12:00 UTC in CET (UTC+1) returns 01:00pm', () => {
    expect(formatTime(DT, CET)).toBe('01:00pm');
  });

  it('midnight UTC returns 12:00am', () => {
    const midnight = 1705276800; // 2024-01-15 00:00:00 UTC
    expect(formatTime(midnight, UTC)).toBe('12:00am');
  });

  it('noon renders without leading zero on hour', () => {
    const result = formatTime(DT, UTC);
    expect(result).not.toMatch(/^0/);
  });
});

describe('formatDate', () => {
  it('returns correct date for UTC', () => {
    expect(formatDate(DT, UTC)).toBe('Jan 15');
  });

  it('advances date when UTC+9 crosses midnight', () => {
    // 2024-01-15 15:00:00 UTC → 2024-01-16 00:00:00 KST
    const dt = 1705276800 + 15 * 3600; // Jan 15 15:00 UTC
    expect(formatDate(dt, KST)).toBe('Jan 16');
  });
});

describe('formatDatetime', () => {
  it('combines date and time correctly', () => {
    expect(formatDatetime(DT, UTC)).toBe('Jan 15. 12:00pm');
  });

  it('uses city local time not server time', () => {
    expect(formatDatetime(DT, KST)).toBe('Jan 15. 09:00pm');
  });
});
