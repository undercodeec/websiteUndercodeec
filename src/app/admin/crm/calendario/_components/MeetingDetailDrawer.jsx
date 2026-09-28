"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { formatInstant, meetingStatus } from "@/lib/hermes/calendar-time";

function safeMeetUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export default function MeetingDetailDrawer({ meeting, timezone, onClose, returnFocusRef }) {
  const dialogRef = useRef(null);
  const isOpen = Boolean(meeting);
  useEffect(() => {
    if (!isOpen) return undefined;
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const trigger = returnFocusRef.current;
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (trigger?.isConnected) trigger.focus();
    };
  }, [isOpen, returnFocusRef]);

  const status = meetingStatus(meeting?.status);
  const meetUrl = safeMeetUrl(meeting?.meetUrl);
  return (
    <dialog ref={dialogRef} className="crm-calendar-drawer" aria-modal="true" aria-labelledby="crm-calendar-detail-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      {meeting && <div className="crm-calendar-drawer-content">
        <header className="crm-calendar-drawer-header">
          <div>
            <span className={`crm-calendar-status crm-calendar-status-${status.tone}`}>{status.label}</span>
            <h2 id="crm-calendar-detail-title">{meeting.contact?.name || "Contacto sin nombre"}</h2>
            {meeting.contact?.company && <p>{meeting.contact.company}</p>}
          </div>
          <button type="button" className="crm-calendar-close" onClick={onClose} autoFocus aria-label="Cerrar detalles">
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        {meeting.status === "PENDING" && <p className="crm-calendar-verification">Hermes está verificando la reunión. Todavía no está confirmada.</p>}
        <dl className="crm-calendar-details">
          <dt>Horario mostrado · {timezone}</dt>
          <dd>{formatInstant(meeting.startAt, timezone)}<br />{formatInstant(meeting.endAt, timezone)}</dd>
          <dt>Zona de la reunión · {meeting.timezone}</dt>
          <dd>{formatInstant(meeting.startAt, meeting.timezone)}<br />{formatInstant(meeting.endAt, meeting.timezone)}</dd>
          <dt>Servicio</dt><dd>{meeting.serviceContext || "Sin contexto de servicio"}</dd>
          <dt>Contacto</dt><dd>{meeting.contact?.email || meeting.contact?.phone || meeting.contact?.waId || "Sin datos de contacto"}</dd>
          {meeting.task && <><dt>Tarea</dt><dd>{meeting.task.title}</dd></>}
          {meeting.cancelledAt && <><dt>Cancelada el</dt><dd>{formatInstant(meeting.cancelledAt, timezone)}</dd></>}
        </dl>
        <nav className="crm-calendar-detail-links" aria-label="Enlaces de la reunión">
          {meetUrl && <a href={meetUrl} target="_blank" rel="noopener noreferrer">Abrir Google Meet</a>}
          {meeting.lead?.id && <a href={`/admin/crm/leads/${encodeURIComponent(meeting.lead.id)}`}>Ver lead</a>}
          {meeting.conversation?.id && <a href={`/admin/crm/inbox?conversationId=${encodeURIComponent(meeting.conversation.id)}`}>Ver conversación</a>}
        </nav>
      </div>}
    </dialog>
  );
}
