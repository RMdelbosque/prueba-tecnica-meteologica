import { Injectable, signal } from '@angular/core';
import * as yaml from 'js-yaml';
import { WeatherData } from '../../interfaces/weather-data-interace';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  // Signal to save data
  private data = signal<WeatherData | null>(null);

  temperatureData = signal<{time: string; value: number}[]>([]);
  powerData = signal<{time: string; value: number}[]>([]);

  constructor() {
    this.loadData();
  }

  // Load the data.yml file from /assets, parse it, and save the result in the “data” signal
  private async loadData() {
    try {
      // Download the YAML file as plain text using fetch
      const res = await fetch('/assets/data.yml');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();

      // Parse the YAML text into a JS object using js-yaml
      const parsed = yaml.load(text) as WeatherData;

      // Ensure that temperature and power exist.
      if (!parsed?.temperature?.values || !parsed?.power?.values)
        throw new Error('Invalid YAML sections');

      // Save the parsed datas
      this.data.set(parsed);
      this.temperatureData.set(parsed.temperature.values);
      this.powerData.set(parsed.power.values);

      console.log('Weather data loaded');
    } catch (err) {
      console.error('Error loading YAML:', err);
    }
  }
}
