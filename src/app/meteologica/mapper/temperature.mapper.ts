import { WeatherData } from '../interfaces/weather-data-interace';

export interface TemperatureRecord {
  time: string;
  celsius: number;
}

// Converts temperature values from kd to °C
export function mapTemperatureData(data: WeatherData | null): TemperatureRecord[] {
  if (!data?.temperature?.values) return [];

  return data.temperature.values.map(v => ({
    time: v.time,
    celsius: Number(v.value) * 0.1 - 273.15, // dK → °C
  }));
}
