import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClockService {
  currentTime = signal<string>('00:00:00');
  private clockTimeoutId: number | null = null;

  constructor() {
    this.startClock();
  }

  private startClock() {
    // Clears any previously saved weather data
    if (this.clockTimeoutId) clearTimeout(this.clockTimeoutId);

    const tick = () => {
      // Get the current time
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');

      // Updates the reactive signal. Automatically refreshes components.
      this.currentTime.set(`${hh}:${mm}:${ss}`);

      // Calculate how long until the next exact second
      const delay = 1000 - now.getMilliseconds();

      // Schedule the next tick while maintaining precision
      this.clockTimeoutId = window.setTimeout(tick, delay);
    };

    tick();
  }
}
