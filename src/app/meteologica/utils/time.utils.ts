// Convierte HH:mm:ss → segundos
export function timeToSeconds(time: string): number {
  const [h, m, s] = time.split(':').map(Number);
  return h * 3600 + m * 60 + s;
}

// Agrupa valores por hora y devuelve medias
export function computeHourlyAverages(
  entries: { time: string; value: number }[]
): { hour: string; value: number }[] {
  const grouped: Record<string, number[]> = {};

  for (const { time, value } of entries) {
    const hour = time.slice(0, 2);
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
