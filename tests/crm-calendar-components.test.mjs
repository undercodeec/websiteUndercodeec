import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

async function loadComponent(file) {
  const url = new URL(`../src/app/admin/crm/calendario/_components/${file}`, import.meta.url);
  const source = await readFile(url, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext },
  }).outputText.replace(/from ["']([^"']+)["']/g, (match, specifier) => {
    const resolved = specifier === '@/lib/hermes/calendar-time'
      ? new URL('../src/lib/hermes/calendar-time.js', import.meta.url).href
      : import.meta.resolve(specifier);
    return `from ${JSON.stringify(resolved)}`;
  });
  return (await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)).default;
}

const meeting = {
  id: 'meeting', status: 'PENDING', startAt: '2026-09-28T16:00:00Z', endAt: '2026-09-28T16:30:00Z',
  timezone: 'Europe/Madrid', meetUrl: null, serviceContext: 'Demo', cancelledAt: null,
  contact: { id: 'contact', name: 'Ana & Luis', company: 'Empresa', email: null, phone: null, waId: '593999999' },
  lead: null, conversation: null, task: null,
};

test('calendar cards show verification, original timezone and selected display time', async () => {
  const CalendarGrid = await loadComponent('CalendarGrid.jsx');
  const html = renderToStaticMarkup(React.createElement(CalendarGrid, {
    days: ['2026-09-28'], meetings: [meeting], timezone: 'America/Guayaquil',
    selectedDay: '2026-09-28', onSelectDay() {}, onSelectMeeting() {},
  }));
  assert.match(html, /En verificación/);
  assert.match(html, /Europe\/Madrid/);
  assert.match(html, /11:00/);
  assert.match(html, /Ana &amp; Luis/);
  assert.match(html, /crm-calendar-mobile/);
  assert.doesNotMatch(html, /Confirmada/);
});

test('meetings outside the timed window remain reachable on desktop', async () => {
  const CalendarGrid = await loadComponent('CalendarGrid.jsx');
  const html = renderToStaticMarkup(React.createElement(CalendarGrid, {
    days: ['2026-09-28'], meetings: [{ ...meeting, startAt: '2026-09-29T03:00:00Z', endAt: '2026-09-29T03:30:00Z' }],
    timezone: 'America/Guayaquil', selectedDay: '2026-09-28', onSelectDay() {}, onSelectMeeting() {},
  }));
  assert.match(html, /Fuera de 07:00–21:00/);
  assert.match(html, /22:00/);
});

test('drawer handles missing relationships and only includes safe, present links', async () => {
  const Drawer = await loadComponent('MeetingDetailDrawer.jsx');
  const render = (value) => renderToStaticMarkup(React.createElement(Drawer, {
    meeting: value, timezone: 'America/Guayaquil', onClose() {}, returnFocusRef: { current: null },
  }));
  const html = render(meeting);
  assert.match(html, /aria-modal="true"/);
  assert.match(html, /En verificación/);
  assert.match(html, /Europe\/Madrid/);
  assert.match(html, /America\/Guayaquil/);
  assert.doesNotMatch(html, /href=/);
  const linked = render({ ...meeting, meetUrl: 'https://meet.google.com/abc', lead: { id: 'lead' }, conversation: { id: 'conversation' } });
  assert.match(linked, /href="https:\/\/meet.google.com\/abc"/);
  assert.match(linked, /href="\/admin\/crm\/leads\/lead"/);
  assert.match(linked, /href="\/admin\/crm\/inbox\?conversationId=conversation"/);
  assert.doesNotMatch(render({ ...meeting, meetUrl: 'javascript:alert(1)' }), /href=/);
});
