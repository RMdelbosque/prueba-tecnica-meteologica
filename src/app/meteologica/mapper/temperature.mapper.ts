import { WeatherData } from '../interfaces/weather-data-interace';

export interface TemperatureRecord {
  time: string;
  celsius: number;
}

// Converts temperature data from deci-Kelvin (dK) to Celsius (°C).
export function mapTemperatureData(data: WeatherData | null): TemperatureRecord[] {
  if (!data?.temperature?.values) return [];

  return data.temperature.values.map(v => ({
    time: v.time,
    celsius: Number(v.value) * 0.1 - 273.15, // dK to °C
  }));
}

// Maps temperature records into a generic structure `{ time, value }`
export function mapTemperatureForCalculations(
  temps: TemperatureRecord[]
): { time: string; value: number }[] {
  return temps.map(t => ({ time: t.time, value: t.celsius }));
}
