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

// Computes averages grouped by minute (e.g. 00:00, 00:01, 00:02...)
export function computeMinuteAverages(
  entries: { time: string; value: number }[]
): { minute: string; value: number }[] {
  const grouped: Record<string, number[]> = {};

  for (const { time, value } of entries) {
    // Take the first 5 chars: "HH:mm"
    const minuteKey = time.slice(0, 5);
    if (!grouped[minuteKey]) grouped[minuteKey] = [];
    grouped[minuteKey].push(value);
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  return Object.entries(grouped)
    .filter(([key]) => {
      const [h, m] = key.split(':').map(Number);
      // Only include minutes up to the current one
      return h < currentHour || (h === currentHour && m <= currentMinute);
    })
    .map(([minute, values]) => ({
      minute,
      value: values.reduce((sum, v) => sum + v, 0) / values.length || 0,
    }));
}
