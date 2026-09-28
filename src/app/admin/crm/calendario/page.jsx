"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { hermesApi } from "@/lib/hermes/api";
import {
  DEFAULT_TIMEZONE, TIMEZONE_OPTIONS, TIMEZONE_STORAGE_KEY, MEETING_STATUSES,
  dayLabel, localParts, shiftDate, weekRange, resolveMeetingSelection,
} from "@/lib/hermes/calendar-time";
import { EmptyState, ErrorState, LoadingState, PageHeader, Toast } from "../_components/Ui";
import CalendarGrid from "./_components/CalendarGrid";
import MeetingDetailDrawer from "./_components/MeetingDetailDrawer";

export default function CalendarPage() {
  const [calendar, setCalendar] = useState({ timezone: DEFAULT_TIMEZONE, date: null, selectedDay: null });
  const [status, setStatus] = useState("");
  const [result, setResult] = useState({ key: "", data: [], loading: true, error: "" });
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [toast, setToast] = useState("");
  const requestId = useRef(0);
  const returnFocusRef = useRef(null);
  const { timezone, date, selectedDay } = calendar;
  const range = useMemo(() => date ? weekRange(date, timezone) : null, [date, timezone]);
  const viewKey = range ? `${range.from}/${range.to}/${status}` : "initial";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let storedTimezone = DEFAULT_TIMEZONE;
      try {
        const stored = window.localStorage.getItem(TIMEZONE_STORAGE_KEY);
        if (TIMEZONE_OPTIONS.some(({ value }) => value === stored)) storedTimezone = stored;
      } catch { /* The calendar also works without persistent storage. */ }
      const today = localParts(new Date(), storedTimezone).date;
      setCalendar({ timezone: storedTimezone, date: today, selectedDay: today });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const loadMeetings = useCallback(async ({ quiet = false, notify = false } = {}) => {
    if (!range) return;
    const id = ++requestId.current;
    setResult((previous) => ({
      key: viewKey, data: previous.key === viewKey ? previous.data : [],
      loading: !quiet, error: "",
    }));
    try {
      // Display timezone changes the range, never filters out another region.
      const response = await hermesApi.meetings({ from: range.from, to: range.to, status: status || undefined });
      if (id !== requestId.current) return;
      setResult({ key: viewKey, data: response.data, loading: false, error: "" });
      if (notify) setToast("Calendario actualizado.");
    } catch (error) {
      if (id !== requestId.current) return;
      const message = error.status === 403 ? "Tu usuario no tiene permiso para consultar las reuniones."
        : error.status === 401 ? "La sesión expiró. Inicia sesión para ver el calendario."
          : error.message || "No se pudieron cargar las reuniones.";
      setResult((previous) => ({ ...previous, loading: false, error: message }));
    }
  }, [range, status, viewKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadMeetings(); }, 0);
    const refreshVisible = () => { if (document.visibilityState === "visible") void loadMeetings({ quiet: true }); };
    const interval = window.setInterval(refreshVisible, 30000);
    document.addEventListener("visibilitychange", refreshVisible);
    return () => {
      requestId.current += 1;
      window.clearTimeout(timer);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshVisible);
    };
  }, [loadMeetings]);

  const moveWeek = (amount) => {
    const next = shiftDate(range.days[0], amount * 7);
    setCalendar((previous) => ({ ...previous, date: next, selectedDay: next }));
  };
  const goToday = () => {
    const today = localParts(new Date(), timezone).date;
    setCalendar((previous) => ({ ...previous, date: today, selectedDay: today }));
  };
  const changeTimezone = (value) => {
    try { window.localStorage.setItem(TIMEZONE_STORAGE_KEY, value); } catch { /* Optional storage. */ }
    setCalendar((previous) => ({ ...previous, timezone: value }));
  };
  const closeMeeting = useCallback(() => setSelectedMeeting(null), []);
  const current = result.key === viewKey;
  const loading = !range || !current || result.loading;

  return (
    <div className="crm-calendar-page">
      <PageHeader eyebrow="Agenda de ventas" title="Calendario"
        description="Reuniones asignadas por Hermes. Consulta su estado y horario en la zona que elijas."
        actions={<button type="button" className="crm-button is-secondary" disabled={loading}
          onClick={() => { void loadMeetings({ notify: true }); }}><RefreshCw size={17} aria-hidden="true" />Actualizar</button>} />
      <div className="crm-calendar-toolbar">
        <div className="crm-calendar-navigation" role="group" aria-label="Navegar entre semanas">
          <button type="button" aria-label="Semana anterior" disabled={!range} onClick={() => moveWeek(-1)}><ChevronLeft size={20} /></button>
          <button type="button" disabled={!range} onClick={goToday}>Hoy</button>
          <button type="button" aria-label="Semana siguiente" disabled={!range} onClick={() => moveWeek(1)}><ChevronRight size={20} /></button>
        </div>
        <h2 className="crm-calendar-range" aria-live="polite">{range ? `${dayLabel(range.days[0])} — ${dayLabel(range.days[6])}` : "Preparando semana…"}</h2>
        <label className="crm-calendar-filter">Zona de visualización
          <select value={timezone} onChange={(event) => changeTimezone(event.target.value)}>
            {TIMEZONE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="crm-calendar-filter">Estado
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Todos los estados</option>
            {Object.entries(MEETING_STATUSES).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}
          </select>
        </label>
      </div>
      <p className="crm-calendar-zone-note"><CalendarDays size={16} aria-hidden="true" />Horarios en {timezone}. Cada reunión conserva su zona original.</p>
      <div className="crm-calendar-legend" aria-label="Estados de las reuniones">
        {Object.entries(MEETING_STATUSES).map(([value, meta]) => <span key={value} className={`crm-calendar-status crm-calendar-status-${meta.tone}`}>{meta.label}</span>)}
      </div>
      {loading ? <LoadingState label="Cargando reuniones…" /> : result.error ? <ErrorState message={result.error}
        onRetry={() => { void loadMeetings(); }} /> : <>
        {result.data.length === 0 && <EmptyState title="Sin reuniones esta semana" description="No hay reuniones en el rango y estado seleccionados." />}
        <CalendarGrid days={range.days} meetings={result.data} timezone={timezone} selectedDay={selectedDay}
          onSelectDay={(value) => setCalendar((previous) => ({ ...previous, selectedDay: value }))}
          onSelectMeeting={(meeting, trigger) => { returnFocusRef.current = trigger; setSelectedMeeting(meeting); }} />
      </>}
      <MeetingDetailDrawer meeting={current ? resolveMeetingSelection(selectedMeeting, result.data) : null} timezone={timezone} onClose={closeMeeting} returnFocusRef={returnFocusRef} />
      <Toast message={toast} onDismiss={() => setToast("")} />
    </div>
  );
}
