import { Injectable, inject, signal, effect } from '@angular/core';
import { WeatherService } from './weather.service';
import { ClockService } from '../clock.service';
import { mapTemperatureData, TemperatureRecord } from '../../mapper/temperature.mapper';
import { getValueAtCurrentTime, computeHourlyAverages } from '../../utils/time.utils';

@Injectable({ providedIn: 'root' })
export class TemperatureService {
  private weather = inject(WeatherService);
  private clock = inject(ClockService);

  currentTemperatureC = signal<number | null>(null);
  hourlyAverages = signal<{ hour: string; value: number }[]>([]);

  constructor() {
    effect(() => {
      const data = this.weather.data();
      const time = this.clock.currentTime();

      const temps: TemperatureRecord[] = mapTemperatureData(data);
      if (!temps.length) return;

      const current = getValueAtCurrentTime(
        temps.map(t => ({ time: t.time, value: t.celsius }))
      );
      if (current !== null) this.currentTemperatureC.set(current);

      this.hourlyAverages.set(
        computeHourlyAverages(
          temps.map(t => ({ time: t.time, value: t.celsius }))
        )
      );
    });
  }
}
