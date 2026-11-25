const DAY_MS = 24 * 60 * 60 * 1000;

export function resolveTimeZone(value) {
  const candidate = value || 'UTC';
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: candidate }).format(new Date());
    return candidate;
  } catch {
    return 'UTC';
  }
}

export function zonedParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    weekday: 'short'
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value])
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: parts.weekday
  };
}

export function dateKeyInZone(date, timeZone) {
  const p = zonedParts(date, timeZone);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

export function addDaysToKey(key, amount) {
  const [year, month, day] = key.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + amount));
  return d.toISOString().slice(0, 10);
}

export function dayOfWeekFromKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function startOfWeekKey(now, timeZone) {
  const today = dateKeyInZone(now, timeZone);
  const weekday = dayOfWeekFromKey(today);
  const daysSinceMonday = (weekday + 6) % 7;
  return addDaysToKey(today, -daysSinceMonday);
}

export function trailingStartKey(now, timeZone, days) {
  return addDaysToKey(dateKeyInZone(now, timeZone), -(days - 1));
}

export function parseGitHubDate(value) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return null;
  const offsetMatch = /([+-])(\d{2}):?(\d{2})$/.exec(value);
  let offsetMinutes = 0;
  if (offsetMatch) {
    offsetMinutes = (offsetMatch[1] === '-' ? -1 : 1) * (Number(offsetMatch[2]) * 60 + Number(offsetMatch[3]));
  }
  const local = new Date(timestamp + offsetMinutes * 60 * 1000);
  const localDate = local.toISOString().slice(0, 10);
  const [year, month, day] = localDate.split('-').map(Number);
  return {
    timestamp,
    iso: new Date(timestamp).toISOString(),
    offsetMinutes,
    localDate,
    localHour: local.getUTCHours(),
    localMinute: local.getUTCMinutes(),
    localWeekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  };
}

export function elapsedDays(timestamp, now) {
  if (!timestamp) return null;
  return Math.max(0, Math.floor((now.getTime() - timestamp) / DAY_MS));
}

export function timeOfDay(hour) {
  if (hour == null) return 'unknown';
  if (hour < 5) return 'late night';
  if (hour < 9) return 'early morning';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'late night';
}

export function isLateNight(hour) {
  return hour != null && (hour < 5 || hour >= 22);
}

export function isWeekend(weekday) {
  return weekday === 0 || weekday === 6;
}

export function isEarlyMorning(hour) {
  return hour != null && hour >= 5 && hour < 9;
}

export function sceneForNow(now, timeZone, latestCommit) {
  const current = zonedParts(now, timeZone);
  const weekendCommit = latestCommit && isWeekend(latestCommit.localWeekday);
  const earlyCommit = latestCommit && isEarlyMorning(latestCommit.localHour);

  let base;
  if (current.hour < 5 || current.hour >= 21) base = 'night';
  else if (current.hour < 8) base = 'sunrise';
  else if (current.hour < 17) base = 'day';
  else base = 'sunset';

  if (earlyCommit) base = 'sunrise';

  return {
    mode: weekendCommit ? 'beach' : base,
    base,
    label: weekendCommit
      ? 'WEEKEND COVE'
      : {
          night: 'NIGHT ROOST',
          sunrise: 'SUNRISE RIDGE',
          day: 'DAYLIGHT ROOST',
          sunset: 'SUNSET DUNES'
        }[base],
    current,
    beach: Boolean(weekendCommit)
  };
}

export function formatClock(hour, minute) {
  if (hour == null) return '—';
  return `${String(hour).padStart(2, '0')}:${String(minute ?? 0).padStart(2, '0')}`;
}

export function formatShortDate(key) {
  if (!key) return '—';
  const [year, month, day] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function humanDays(value) {
  if (value == null) return '—';
  if (value === 0) return 'today';
  if (value === 1) return '1 day';
  return `${value} days`;
}
