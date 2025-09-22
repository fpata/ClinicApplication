import { Injectable } from '@angular/core';

/**
 * UtilityService
 * Generic date/time formatting helper.
 * Supported tokens:
 *  yyyy - 4 digit year
 *  MM   - month (01-12)
 *  dd   - day of month (01-31)
 *  HH   - hours 24h (00-23)
 *  hh   - hours 12h (01-12)
 *  h    - hours 12h (1-12)
 *  mm   - minutes (00-59)
 *  ss   - seconds (00-59)
 *  tt   - AM/PM
 */
@Injectable({ providedIn: 'root' })
export class UtilityService {

  format(dateInput: Date | string | number, pattern: string = 'yyyy-MM-dd'): string {
    const date = this.coerce(dateInput);
    if (!date) return '';

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour24 = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

    // Replace longer tokens first to avoid partial collisions
    return pattern
      .replace(/yyyy/g, year.toString())
      .replace(/MM/g, this.pad(month))
      .replace(/dd/g, this.pad(day))
      .replace(/HH/g, this.pad(hour24))
      .replace(/hh/g, this.pad(hour12))
      .replace(/h/g, hour12.toString())
      .replace(/mm/g, this.pad(minutes))
      .replace(/ss/g, this.pad(seconds))
      .replace(/tt/g, ampm);
  }

  formatDate(dateInput: Date | string | number, dateformat?: string|null): string {
    if(dateformat === null || dateformat === undefined)
      dateformat = 'yyyy-MM-dd';
    return this.format(dateInput, dateformat);
  }

  formatDateTime(dateInput: Date | string | number, dateformat?: string|null): string {
    if(dateformat === null || dateformat === undefined)
      dateformat = 'yyyy-MM-ddTHH:mm:ss';
    return this.format(dateInput, dateformat);
  }

  private pad(n: number): string { return n.toString().padStart(2, '0'); }

  private coerce(value: Date | string | number): Date | null {
    if (value instanceof Date) return value;
    if (typeof value === 'number') return new Date(value);
    if (typeof value === 'string') {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return null;
  }

  /**
   * Converts a local Date (interpreted in the current timezone) to a UTC Date object
   * representing the same wall clock components. Useful only if you must persist wall time
   * but backend interprets as UTC. (Usually prefer storing real UTC instant instead.)
   */
  localWallTimeToUtc(dateInput: Date | string | number): Date | null {
    const d = this.coerce(dateInput);
    if (!d) return null;
    // Build a UTC date with same Y-M-D-H-M-S parts
    return new Date(Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
      d.getMilliseconds()
    ));
  }

  /**
   * Creates a local Date from a UTC date that was previously produced by localWallTimeToUtc.
   * (Inverse operation for display.)
   */
  utcWallTimeToLocal(dateInput: Date | string | number): Date | null {
    const d = this.coerce(dateInput);
    if (!d) return null;
    return new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
      d.getMilliseconds()
    );
  }

  /**
   * Returns a local wall time string (no timezone) suitable for storing without TZ shift.
   * Format: yyyy-MM-ddTHH:mm:ss
   */
  toLocalDateTimeString(dateInput: Date | string | number): string {
    return this.formatDateTime(dateInput, 'yyyy-MM-ddTHH:mm:ss');
  }

  validateEmail(email: string) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  validateMobile(mobile: string) {
    // Allows digits, spaces, +, and - characters
    const mobilePattern = /^[\d+\-\s]+$/;
    return mobilePattern.test(mobile.trim());
  }
   
}
