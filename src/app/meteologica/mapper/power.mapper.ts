import { WeatherData } from '../interfaces/weather-data-interace';
import { parseNumberEU } from '../utils/time.utils';

export interface PowerRecord {
  time: string;
  kWh: number;
}

// Converts power values from MW (every 5 s) to kWh produced in that interval
export function mapPowerData(data: WeatherData | null): PowerRecord[] {
  if (!data?.power?.values) return [];

  const SECONDS_INTERVAL = 5;
  const SECONDS_PER_HOUR = 3600;

  let lastValid = 0;

  return data.power.values.map(v => {
    const raw = parseNumberEU(v.value);
    const kWh = raw * 1000 * (SECONDS_INTERVAL / SECONDS_PER_HOUR);

    if (!isNaN(kWh) && kWh !== null) lastValid = kWh;

    return { time: v.time, kWh: !isNaN(kWh) ? kWh : lastValid };
  });


}

// Simplifies structure for utils (e.g. getValueAtCurrentTime, averages)
export function mapPowerForCalculations(
  powers: PowerRecord[]
): { time: string; value: number }[] {
  return powers.map(p => ({ time: p.time, value: p.kWh }));
}
