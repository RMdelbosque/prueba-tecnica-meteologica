import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClockService {
  currentTime = signal<string>('00:00:00');
  private clockTimeoutId: number | null = null;

  constructor() {
    this.startClock();
  }

  private startClock() {
    if (this.clockTimeoutId) clearTimeout(this.clockTimeoutId); // Clears any previously saved weather data

    const tick = () => {
      const now = new Date(); // Get the current time
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      this.currentTime.set(`${hh}:${mm}:${ss}`);

      // Precise adjustment to the next second
      const delay = 1000 - now.getMilliseconds();
      this.clockTimeoutId = window.setTimeout(tick, delay);
    };

    tick();
  }
}
