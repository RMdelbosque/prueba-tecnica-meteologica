import { WeatherData } from '../interfaces/weather-data-interace';
import { parseNumberEU } from '../utils/time.utils';

export interface TemperatureRecord {
  time: string;
  celsius: number;
}

// Converts temperature data from deci-Kelvin (dK) to Celsius (°C).
export function mapTemperatureData(data: WeatherData | null): TemperatureRecord[] {
  if (!data?.temperature?.values) return [];

  let lastValid = 0;

  return data.temperature.values.map(v => {
    // Convert string (possibly "273,15" or "273.15") to number
    const raw = parseNumberEU(v.value);

    // Convert from deci-Kelvin (dK) to °C
    const celsius = raw * 0.1 - 273.15;

    // If the value is valid, keep it; otherwise reuse last valid one
    if (!isNaN(celsius) && celsius !== null) lastValid = celsius;

    return {
      time: v.time,
      celsius: !isNaN(celsius) ? celsius : lastValid,
    };
  });
}

// Maps temperature records into a generic structure `{ time, value }`
export function mapTemperatureForCalculations(
  temps: TemperatureRecord[]
): { time: string; value: number }[] {
  return temps.map(t => ({ time: t.time, value: t.celsius }));
}
