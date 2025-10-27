import { Injectable, inject, signal, effect } from '@angular/core';
import { WeatherService } from './weather.service';
import { ClockService } from '../clock.service';
import { mapPowerData, mapPowerForCalculations } from '../../mapper/power.mapper';
import { getValueAtCurrentTime, computeMinuteAverages } from '../../utils/time.utils';

@Injectable({ providedIn: 'root' })
export class PowerService {
  private weather = inject(WeatherService); // Data source

  private clock = inject(ClockService); // Source: real-time clock

  currentPowerKWh = signal<number | null>(null); // Energy produced in the last interval
  minuteAverages = signal<{ minute: string; value: number }[]>([]); // Average energy per minute

  constructor() {
    effect(() => {
      // power YAML dataset
      const data = this.weather.powerData();
      const time = this.clock.currentTime(); // triggers updates each second

      if (!data?.values) return;

      // Convert MW → kWh (per 5 s interval)
      const powers = mapPowerData({ power: { values: data } } as any);

      if (!powers.length) return;

      // Compute current produced energy at current time
      const currentEnergy = getValueAtCurrentTime(mapPowerForCalculations(powers));
      if (currentEnergy !== null && !isNaN(currentEnergy)) {
        this.currentPowerKWh.set(currentEnergy);
      }

      // Compute average energy per minute (for graphing)
      this.minuteAverages.set(
        computeMinuteAverages(mapPowerForCalculations(powers))
      );
    });
  }
}
