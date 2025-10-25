import { Injectable, inject, signal, effect } from '@angular/core';
import { WeatherService } from './weather.service';
import { ClockService } from '../clock.service';
import { mapTemperatureData, mapTemperatureForCalculations, TemperatureRecord } from '../../mapper/temperature.mapper';
import { getValueAtCurrentTime, computeHourlyAverages, computeMinuteAverages } from '../../utils/time.utils';

@Injectable({ providedIn: 'root' })
export class TemperatureService {
  private weather = inject(WeatherService); // Data source
  private clock = inject(ClockService); // Current time

  currentTemperatureC = signal<number | null>(null); // Current temperature in °C
  minuteAverages = signal<{ minute: string; value: number }[]>([]); // Average temperature per minutes

  constructor() {
    effect(() => {
      // temperature YAML dataset
      const data = this.weather.temperatureData();
      const time = this.clock.currentTime(); // triggers updates each second

      if (!data?.values) return;

      // Convert dK to °C
      const temperatures = mapTemperatureData({temperature: {values: data}} as any);

      if (!temperatures.length) return;

      // Prepare entries for calculation utils
      // const entries = mapTemperatureForCalculations(temperatures);

      //  Update current temperature based on the current time
      const currentTemperature = getValueAtCurrentTime(mapTemperatureForCalculations(temperatures));
      if (currentTemperature !== null) this.currentTemperatureC.set(currentTemperature);

      // Update hourly averages
      this.minuteAverages.set(
        computeMinuteAverages(mapTemperatureForCalculations(temperatures))
      );
    });
  }
}
