// Converts HH:mm:ss → total seconds
export function timeToSeconds(time: string): number {
  const [h, m, s] = time.split(':').map(Number);
  return h * 3600 + m * 60 + s;
}

// Returns the latest value before or equal to the current time
export function getValueAtCurrentTime(
  entries: { time: string; value: number }[]
): number | null {
  const now = new Date();
  const nowSec = timeToSeconds(
    `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  );

  let last: number | null = null;
  for (const e of entries) {
    const sec = timeToSeconds(e.time);
    if (sec <= nowSec) last = e.value;
    else break;
  }
  return last;
}

// Returns a valid number or NaN if conversion fails.
export function parseNumberEU(value: unknown): number {
  if (value === null || value === undefined) return NaN;
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return NaN;

  // Replace comma with dot for European decimal formats
  const normalized = value.replace(',', '.').trim();
  const num = Number(normalized);

  return isNaN(num) ? NaN : num;
}

// Computes averages grouped by hour
export function computeHourlyAverages(
  entries: { time: string; value: number }[]
): { hour: string; value: number }[] {
  const grouped: Record<string, number[]> = {};

  for (const { time, value } of entries) {
    const hour = time.slice(0, 2); // e.g., "13"
    if (!grouped[hour]) grouped[hour] = [];
    grouped[hour].push(value);
  }

  return Object.entries(grouped)
    .filter(([hour]) => Number(hour) <= new Date().getHours())
    .map(([hour, values]) => ({
      hour,
      value: values.reduce((sum, v) => sum + v, 0) / values.length || 0,
    }));
}


export function computeMinuteAverages(
  entries: { time: string; value: number }[]
): { minute: string; value: number }[] {
  if (!entries?.length) return [];

  // Group values by minute (ignoring NaN)
  const grouped: Record<string, number[]> = {};
  for (const { time, value } of entries) {
    if (isNaN(value) || value === null) continue;
    const minute = time.slice(0, 5); // HH:mm
    if (!grouped[minute]) grouped[minute] = [];
    grouped[minute].push(value);
  }

  // Calculate existing averages per minute
  const averages = Object.entries(grouped).map(([minute, values]) => ({
    minute,
    value: values.reduce((sum, v) => sum + v, 0) / values.length || 0,
  }));

  // Sort averages by hour:minute
  averages.sort((a, b) => (a.minute > b.minute ? 1 : -1));

  // Interpolate the gaps between actual points (12:00 - 13:00)
  const interpolated = interpolateMissingValues(averages);

  // Fill in the missing minutes until the current time (maintains continuity)
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const filled: { minute: string; value: number }[] = [];
  let lastValue = interpolated[0]?.value ?? 0;

  for (let h = 0; h <= currentHour; h++) {
    const maxMinute = h === currentHour ? currentMinute : 59;
    for (let m = 0; m <= maxMinute; m++) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      const key = `${hh}:${mm}`;

      const found = interpolated.find((a) => a.minute === key);
      if (found && !isNaN(found.value)) {
        lastValue = found.value;
        filled.push(found);
      } else {
        filled.push({ minute: key, value: lastValue });
      }
    }
  }

  return filled;
}


// Linearly interpolates missing values between two known data points.
export function interpolateMissingValues(
  entries: { minute: string; value: number }[]
): { minute: string; value: number }[] {
  if (entries.length < 2) return entries;

  const result: { minute: string; value: number }[] = [];

  for (let i = 0; i < entries.length - 1; i++) {
    const current = entries[i];
    const next = entries[i + 1];

    result.push(current); // always add the current point

    // Parse "HH:mm" into total minutes
    const [h1, m1] = current.minute.split(':').map(Number);
    const [h2, m2] = next.minute.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);

    if (diff > 1) {
      // Linear interpolation for each missing minute
      for (let j = 1; j < diff; j++) {
        const t = j / diff; // ratio between 0 and 1
        const interpolated = current.value + t * (next.value - current.value);

        const interpolatedDate = new Date();
        interpolatedDate.setHours(h1);
        interpolatedDate.setMinutes(m1 + j);

        const hh = String(interpolatedDate.getHours()).padStart(2, '0');
        const mm = String(interpolatedDate.getMinutes()).padStart(2, '0');

        result.push({ minute: `${hh}:${mm}`, value: interpolated });
      }
    }
  }

  // Add the last data point
  result.push(entries[entries.length - 1]);

  return result;
}
