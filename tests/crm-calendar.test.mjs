import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  weekRange, localParts, dayRange, eventLayout, eventsForDay,
  layoutDayEvents, meetingStatus, shiftDate, resolveMeetingSelection,
} from '../src/lib/hermes/calendar-time.js';

test('Guayaquil weeks start at local Monday midnight regardless of host timezone', () => {
  assert.deepEqual(weekRange('2026-09-30', 'America/Guayaquil'), {
    from: '2026-09-28T05:00:00.000Z', to: '2026-10-05T05:00:00.000Z',
    days: ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
  });
  assert.equal(shiftDate('2026-12-31', 1), '2027-01-01');
});

test('one UTC instant displays as 14:00 Madrid, 13:00 Canary and 07:00 Ecuador', () => {
  const instant = '2026-09-28T12:00:00Z';
  assert.deepEqual(localParts(instant, 'Europe/Madrid'), { date: '2026-09-28', hour: 14, minute: 0 });
  assert.equal(localParts(instant, 'Atlantic/Canary').hour, 13);
  assert.equal(localParts(instant, 'America/Guayaquil').hour, 7);
});

test('Madrid spring and fall weeks use 167 and 169 elapsed hours', () => {
  const spring = weekRange('2026-03-29', 'Europe/Madrid');
  assert.equal(spring.from, '2026-03-22T23:00:00.000Z');
  assert.equal(spring.to, '2026-03-29T22:00:00.000Z');
  assert.equal((Date.parse(spring.to) - Date.parse(spring.from)) / 3600000, 167);
  const fall = weekRange('2026-10-25', 'Europe/Madrid');
  assert.equal(fall.from, '2026-10-18T22:00:00.000Z');
  assert.equal(fall.to, '2026-10-25T23:00:00.000Z');
  assert.equal((Date.parse(fall.to) - Date.parse(fall.from)) / 3600000, 169);
  assert.deepEqual(localParts('2026-03-29T01:00:00Z', 'Europe/Madrid'), { date: '2026-03-29', hour: 3, minute: 0 });
  assert.equal(dayRange('2026-10-25', 'Europe/Madrid').to, '2026-10-25T23:00:00.000Z');
});

test('15 minute grid places and clips meetings within 07:00–21:00', () => {
  assert.deepEqual(eventLayout({ startMinute: 14 * 60 + 15, endMinute: 15 * 60 }), {
    top: 580, height: 60, outside: false,
  });
  assert.deepEqual(eventLayout({ startMinute: 6 * 60 + 45, endMinute: 7 * 60 + 30 }), {
    top: 0, height: 40, outside: false,
  });
  assert.equal(eventLayout({ startMinute: 22 * 60, endMinute: 23 * 60 }).outside, true);
});

test('multi-day and adjacent meetings are assigned to the correct day without duplication', () => {
  const crossing = { id: 'cross', startAt: '2026-09-29T04:30:00Z', endAt: '2026-09-29T05:30:00Z' };
  const adjacent = { id: 'next', startAt: '2026-09-29T05:00:00Z', endAt: '2026-09-29T06:00:00Z' };
  const monday = eventsForDay([crossing, adjacent], '2026-09-28', 'America/Guayaquil');
  assert.equal(monday.length, 1);
  assert.equal(monday[0].startMinute, 1410);
  assert.equal(monday[0].endMinute, 1440);
  assert.equal(eventsForDay([crossing], '2026-09-29', 'America/Guayaquil')[0].startMinute, 0);
});

test('overlapping cards get separate columns while adjacent cards use full width', () => {
  const result = layoutDayEvents([
    { id: 'a', startMinute: 480, endMinute: 540 },
    { id: 'b', startMinute: 510, endMinute: 570 },
    { id: 'c', startMinute: 570, endMinute: 600 },
  ]);
  assert.deepEqual(result.map(({ column, columns }) => [column, columns]), [[0, 2], [1, 2], [0, 1]]);
});

test('pending meetings are labelled as verification and all statuses remain distinct', () => {
  assert.equal(meetingStatus('PENDING').label, 'En verificación');
  assert.equal(meetingStatus('CONFIRMED').label, 'Confirmada');
  assert.equal(meetingStatus('CANCELLED').label, 'Cancelada');
  assert.equal(meetingStatus('FAILED').label, 'Fallida');
  assert.equal(new Set(['PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED'].map((s) => meetingStatus(s).tone)).size, 4);
});

test('open meeting selection follows refreshed status and time and closes when removed', () => {
  const selected = { id: 'selected', status: 'CONFIRMED', startAt: '2026-09-28T16:00:00Z' };
  const updated = { ...selected, status: 'CANCELLED', startAt: '2026-09-29T16:00:00Z' };
  assert.deepEqual(resolveMeetingSelection(selected, [updated]), updated);
  assert.equal(resolveMeetingSelection(selected, []), null);
  assert.equal(resolveMeetingSelection(null, [updated]), null);
});

test('meetings API uses the authenticated proxy with only defined calendar parameters', async () => {
  const source = await readFile(new URL('../src/lib/hermes/api.js', import.meta.url), 'utf8');
  const { hermesApi } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const previousFetch = globalThis.fetch;
  const previousWindow = globalThis.window;
  globalThis.window = { sessionStorage: { getItem: () => 'test-bearer' } };
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/hermes/meetings?from=2026-09-28T05%3A00%3A00.000Z&to=2026-10-05T05%3A00%3A00.000Z&status=PENDING');
    assert.equal(options.headers.get('authorization'), 'Bearer test-bearer');
    assert.equal(options.cache, 'no-store');
    return Response.json({ data: [], range: {} });
  };
  try {
    assert.deepEqual(await hermesApi.meetings({ from: '2026-09-28T05:00:00.000Z', to: '2026-10-05T05:00:00.000Z', status: 'PENDING', timezone: undefined }), { data: [], range: {} });
  } finally {
    globalThis.fetch = previousFetch;
    globalThis.window = previousWindow;
  }
});
