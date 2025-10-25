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
  const grouped: Record<string, number[]> = {};

  for (const { time, value } of entries) {
    const minute = time.slice(0, 5); // HH:mm
    if (!grouped[minute]) grouped[minute] = [];
    grouped[minute].push(value);
  }

  // Calcular medias
  const averages = Object.entries(grouped).map(([minute, values]) => ({
    minute,
    value: values.reduce((sum, v) => sum + v, 0) / values.length || 0,
  }));

  // 🔹 Ordenar por minuto
  averages.sort((a, b) => (a.minute > b.minute ? 1 : -1));

  // 🔹 Rellenar minutos faltantes con el último valor conocido
  const filled: { minute: string; value: number }[] = [];
  let lastValue = averages[0]?.value ?? 0;

  const firstTime = averages[0]?.minute;
  const lastTime = averages[averages.length - 1]?.minute;
  if (!firstTime || !lastTime) return [];

  const [startH, startM] = firstTime.split(':').map(Number);
  const [endH, endM] = lastTime.split(':').map(Number);
  const totalMinutes = (endH - startH) * 60 + (endM - startM);

  for (let i = 0; i <= totalMinutes; i++) {
    const currentDate = new Date();
    currentDate.setHours(startH);
    currentDate.setMinutes(startM + i);
    const mm = String(currentDate.getMinutes()).padStart(2, '0');
    const hh = String(currentDate.getHours()).padStart(2, '0');
    const key = `${hh}:${mm}`;

    const found = averages.find(a => a.minute === key);
    if (found) {
      lastValue = found.value;
      filled.push(found);
    } else {
      filled.push({ minute: key, value: lastValue });
    }
  }

  return filled;
}
