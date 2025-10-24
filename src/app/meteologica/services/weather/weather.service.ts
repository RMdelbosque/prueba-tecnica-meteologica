import { Injectable, signal } from '@angular/core';
import * as yaml from 'js-yaml';
import { WeatherData } from '../../interfaces/weather-data-interace';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  // Signal to save data
  data = signal<WeatherData | null>(null);

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
        throw new Error('YAML sin secciones válidas');

      // Save the parsed data
      this.data.set(parsed);

      console.log('✅ YAML cargado');
    } catch (err) {
      console.error('❌ Error cargando YAML:', err);
    }
  }
}
