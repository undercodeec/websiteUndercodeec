"use client";

import {
  dayLabel, eventsForDay, eventLayout, formatTime, GRID_HEIGHT,
  layoutDayEvents, localParts, meetingStatus,
} from "@/lib/hermes/calendar-time";

function MeetingCard({ meeting, timezone, onSelect, style, compact = false }) {
  const status = meetingStatus(meeting.status);
  const name = meeting.contact?.name || meeting.contact?.company || "Contacto sin nombre";
  const time = `${formatTime(meeting.startAt, timezone)}–${formatTime(meeting.endAt, timezone)}`;
  return (
    <button
      type="button"
      className={`crm-calendar-event crm-calendar-event-${status.tone} ${compact ? "crm-calendar-event-agenda" : style?.height < 40 ? "crm-calendar-event-short" : ""}`}
      style={style}
      onClick={(event) => onSelect(meeting, event.currentTarget)}
      aria-label={`${name}, ${time}, ${status.label}. Zona de la reunión: ${meeting.timezone}. Ver detalles`}
      title={`${name} · ${time} · ${status.label} · ${meeting.timezone}`}
    >
      <time>{time}</time>
      <strong>{name}</strong>
      <span>{status.label}</span>
      <small>{meeting.timezone}</small>
    </button>
  );
}

export default function CalendarGrid({ days, meetings, timezone, selectedDay, onSelectDay, onSelectMeeting }) {
  const today = localParts(new Date(), timezone).date;
  const dayEvents = days.map((date) => ({ date, events: eventsForDay(meetings, date, timezone) }));
  const selected = dayEvents.find(({ date }) => date === selectedDay) || dayEvents[0];
  const outside = dayEvents.flatMap(({ date, events }) => events
    .filter((event) => eventLayout(event).outside).map((event) => ({ date, event })));

  return (
    <>
      <section className="crm-calendar-desktop" aria-label={`Calendario semanal en ${timezone}`}>
        <div className="crm-calendar-week-header">
          <span className="crm-calendar-hour-heading">Hora</span>
          {days.map((date) => <div key={date} className={`crm-calendar-day-heading ${date === today ? "crm-calendar-day-today" : ""}`}>
            <time dateTime={date}>{dayLabel(date)}</time>
            {date === today && <small>Hoy</small>}
          </div>)}
        </div>
        <div className="crm-calendar-scroll">
          <div className="crm-calendar-week-body" style={{ height: GRID_HEIGHT }}>
            <div className="crm-calendar-hours" aria-hidden="true">
              {Array.from({ length: 15 }, (_, index) => <span key={index} style={{ top: index * 80 }}>{String(index + 7).padStart(2, "0")}:00</span>)}
            </div>
            {dayEvents.map(({ date, events }) => <div key={date} className="crm-calendar-day-column" aria-label={dayLabel(date)}>
              {layoutDayEvents(events.filter((event) => !eventLayout(event).outside)).map((event) => {
                const { top, height } = eventLayout(event);
                return <MeetingCard key={event.id} meeting={event} timezone={timezone} onSelect={onSelectMeeting}
                  style={{ top, height, left: `calc(${event.column * 100 / event.columns}% + 2px)`, width: `calc(${100 / event.columns}% - 4px)` }} />;
              })}
            </div>)}
          </div>
        </div>
        {outside.length > 0 && <div className="crm-calendar-outside">
          <h2>Fuera de 07:00–21:00</h2>
          <div className="crm-calendar-agenda-list">
            {outside.map(({ date, event }) => <div key={`${date}-${event.id}`}>
              <time dateTime={date}>{dayLabel(date)}</time>
              <MeetingCard meeting={event} timezone={timezone} onSelect={onSelectMeeting} compact />
            </div>)}
          </div>
        </div>}
      </section>

      <section className="crm-calendar-mobile" aria-label={`Agenda diaria en ${timezone}`}>
        <div className="crm-calendar-day-selector" role="group" aria-label="Seleccionar día">
          {days.map((date) => <button key={date} type="button" aria-pressed={selected?.date === date}
            onClick={() => onSelectDay(date)}>
            <span>{dayLabel(date, { month: undefined })}</span>
            {date === today && <small>Hoy</small>}
          </button>)}
        </div>
        <h2>{selected && dayLabel(selected.date, { weekday: "long" })}</h2>
        <div className="crm-calendar-agenda-list">
          {selected?.events.length ? selected.events.map((event) => <MeetingCard key={event.id}
            meeting={event} timezone={timezone} onSelect={onSelectMeeting} compact />)
            : <p className="crm-calendar-day-empty">No hay reuniones para este día.</p>}
        </div>
      </section>
    </>
  );
}
