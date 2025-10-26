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

  // Group entries by minute (HH:mm), ignoring NaN or invalid values
  const grouped: Record<string, number[]> = {};
  for (const { time, value } of entries) {
    if (isNaN(value) || value === null) continue;
    const minute = time.slice(0, 5);
    if (!grouped[minute]) grouped[minute] = [];
    grouped[minute].push(value);
  }

  // Compute averages for each minute
  const averages = Object.entries(grouped).map(([minute, values]) => ({
    minute,
    value: values.reduce((sum, v) => sum + v, 0) / values.length || 0,
  }));

  // Sort by time
  averages.sort((a, b) => (a.minute > b.minute ? 1 : -1));

  // Fill missing minutes from 00:00 to current time
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const filled: { minute: string; value: number }[] = [];
  let lastValue = averages[0]?.value ?? 0;

  for (let h = 0; h <= currentHour; h++) {
    const maxMinute = h === currentHour ? currentMinute : 59;
    for (let m = 0; m <= maxMinute; m++) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      const key = `${hh}:${mm}`;

      // If data exists for this minute, use it; otherwise keep last known
      const found = averages.find((a) => a.minute === key);
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
