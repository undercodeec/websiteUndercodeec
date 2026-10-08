"use client";

import Link from "next/link";
import { useCallback, useDeferredValue, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  Bot,
  Check,
  ChevronDown,
  Clock3,
  Inbox,
  LockKeyhole,
  MessageCircle,
  MoreHorizontal,
  Phone,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  UserRound,
  UserRoundCheck,
  X,
} from "lucide-react";
import {
  HERMES_CONVERSATION_READ_EVENT,
  HERMES_CUSTOMER_MESSAGE_EVENT,
  hermesApi,
} from "@/lib/hermes/api";
import { useCrmSession } from '../_components/CrmSession';
import { presentHermesIncident } from "@/lib/hermes/incidents.mjs";
import {
  activeHandoff,
  CONVERSATION_STATUS,
  HANDOFF_REASON,
  HANDOFF_STATUS,
  SENDER_META,
  STAGE_META,
} from "../_components/constants";
import {
  apiErrorMessage,
  contactName,
  contactPhone,
  formatDate,
  initials,
  lastMessage,
  relativeDate,
} from "../_components/format";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  SearchField,
  StageBadge,
  Toast,
} from "../_components/Ui";

const RESOLUTION_OPTIONS = [
  {
    value: "RETURN_TO_HERMES",
    label: "Devolver a Hermes",
    description: "Resuelve el handoff y reactiva la atención automática.",
    icon: RotateCcw,
  },
  {
    value: "CLOSE_CONVERSATION",
    label: "Cerrar conversación",
    description: "Resuelve el handoff y da por terminada la conversación.",
    icon: Check,
  },
  {
    value: "KEEP_HUMAN",
    label: "Mantener control humano",
    description: "Registra el avance y conserva la conversación en atención humana.",
    icon: UserRoundCheck,
  },
];

function InboxMedia({ conversationId, message }) {
  const [url, setUrl] = useState('');
  const [mime, setMime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  const open = async () => {
    setLoading(true);
    setError('');
    try {
      const blob = await hermesApi.inboxMedia(conversationId, message.id);
      setMime(blob.type);
      setUrl(URL.createObjectURL(blob));
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Adjunto no disponible.'));
    } finally {
      setLoading(false);
    }
  };
  return <div className="crm-inbox-media">
    {!url && <button type="button" className="crm-button is-secondary" onClick={open} disabled={loading}>
      {loading ? 'Abriendo…' : `Ver ${message.type === 'IMAGE' ? 'imagen' : 'PDF'} en Inbox`}
    </button>}
    {url && mime.startsWith('image/') &&
      // Blob URL is fetched with the CRM JWT and must not pass through Next Image optimization.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="Comprobante enviado por el cliente" style={{ maxWidth: '100%', maxHeight: 420 }} />}
    {url && mime === 'application/pdf' && <iframe src={`${url}#toolbar=0`} title="Comprobante PDF" style={{ width: '100%', height: 420, border: 0 }} />}
    {error && <span role="alert">{error}</span>}
  </div>;
}

export default function InboxPage() {
  const { user } = useCrmSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialConversationId = searchParams.get("conversationId") || "";
  const initialPriority = searchParams.get("priorityOnly") === "true";
  const [conversations, setConversations] = useState([]);
  const [listMeta, setListMeta] = useState({ total: 0, totalPages: 1 });
  const [selectedId, setSelectedId] = useState(initialConversationId);
  const [conversation, setConversation] = useState(null);
  const [transfer, setTransfer] = useState(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [selectedProofId, setSelectedProofId] = useState('');
  const [messages, setMessages] = useState([]);
  const [messagePage, setMessagePage] = useState(1);
  const [messagePages, setMessagePages] = useState(1);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityOnly, setPriorityOnly] = useState(initialPriority);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [reply, setReply] = useState("");
  const [resolutionOpen, setResolutionOpen] = useState(false);
  const [takeoverOpen, setTakeoverOpen] = useState(false);
  const [takeoverReason, setTakeoverReason] = useState("CUSTOM");
  const [takeoverDetail, setTakeoverDetail] = useState("");
  const [resolutionAction, setResolutionAction] = useState("RETURN_TO_HERMES");
  const [resolutionText, setResolutionText] = useState("");
  const [toast, setToast] = useState(null);
  const messagesEndRef = useRef(null);

  const loadConversations = useCallback(async (quiet = false) => {
    if (!quiet) setListLoading(true);
    setListError("");
    try {
      const result = await hermesApi.conversations({
        page: 1,
        limit: 50,
        query: deferredSearch,
        status: statusFilter,
        priorityOnly: priorityOnly || "",
      });
      const items = result?.data || [];
      setConversations(items);
      setListMeta({
        total: result?.total || 0,
        totalPages: result?.totalPages || 1,
      });
      setSelectedId((current) => current || items[0]?.id || "");
    } catch (requestError) {
      setListError(
        apiErrorMessage(requestError, "No se pudieron cargar las conversaciones."),
      );
    } finally {
      if (!quiet) setListLoading(false);
    }
  }, [deferredSearch, priorityOnly, statusFilter]);

  const loadConversation = useCallback(async (id, quiet = false) => {
    if (!id) {
      setConversation(null);
      setTransfer(null);
      setMessages([]);
      return;
    }
    if (!quiet) setDetailLoading(true);
    setDetailError("");
    try {
      const [detail, history, payment] = await Promise.all([
        hermesApi.conversation(id),
        hermesApi.messages(id, { page: 1, limit: 50 }),
        hermesApi.transferByConversation(id),
      ]);
      setConversation(detail);
      setTransfer(payment);
      setSelectedProofId((current) => payment?.proofMessages?.some((proof) => proof.messageId === current)
        ? current : payment?.proofMessages?.at(-1)?.messageId || '');
      setMessages(history?.data || []);
      setMessagePage(1);
      setMessagePages(history?.totalPages || 1);
      if (!quiet) {
        window.setTimeout(
          () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          50,
        );
      }
    } catch (requestError) {
      setDetailError(
        apiErrorMessage(requestError, "No se pudo abrir la conversación."),
      );
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadConversations, 120);
    return () => window.clearTimeout(timer);
  }, [loadConversations]);

  useEffect(() => {
    loadConversation(selectedId);
  }, [loadConversation, selectedId]);

  useEffect(() => {
    if (!selectedId || document.visibilityState !== "visible") return;
    window.dispatchEvent(
      new CustomEvent(HERMES_CONVERSATION_READ_EVENT, {
        detail: { conversationId: selectedId },
      }),
    );
  }, [selectedId, messages]);

  useEffect(() => {
    const handleCustomerMessage = (event) => {
      const incoming = event.detail;
      void loadConversations(true);
      if (incoming?.conversationId === selectedId) {
        void loadConversation(selectedId, true).then(() => {
          window.setTimeout(
            () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
            30,
          );
        });
      }
    };
    window.addEventListener(HERMES_CUSTOMER_MESSAGE_EVENT, handleCustomerMessage);
    return () => {
      window.removeEventListener(HERMES_CUSTOMER_MESSAGE_EVENT, handleCustomerMessage);
    };
  }, [loadConversation, loadConversations, selectedId]);

  useEffect(() => {
    const refreshQuietly = () => {
      void loadConversations(true);
      if (selectedId) void loadConversation(selectedId, true);
    };
    const interval = window.setInterval(refreshQuietly, 15000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshQuietly();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [loadConversation, loadConversations, selectedId]);

  const selectConversation = (id) => {
    setTakeoverOpen(false);
    setSelectedId(id);
    const params = new URLSearchParams();
    params.set("conversationId", id);
    if (priorityOnly) params.set("priorityOnly", "true");
    router.replace(`/admin/crm/inbox?${params.toString()}`, { scroll: false });
  };

  const refreshAll = async () => {
    await Promise.all([
      loadConversations(),
      selectedId ? loadConversation(selectedId, true) : Promise.resolve(),
    ]);
    setToast({ tone: "success", message: "Inbox actualizado." });
  };

  const loadOlderMessages = async () => {
    if (!selectedId || loadingOlder || messagePage >= messagePages) return;
    setLoadingOlder(true);
    try {
      const nextPage = messagePage + 1;
      const result = await hermesApi.messages(selectedId, {
        page: nextPage,
        limit: 50,
      });
      setMessages((items) => [...(result?.data || []), ...items]);
      setMessagePage(nextPage);
      setMessagePages(result?.totalPages || messagePages);
    } catch (requestError) {
      setToast({
        tone: "error",
        message: apiErrorMessage(requestError, "No se cargaron los mensajes anteriores."),
      });
    } finally {
      setLoadingOlder(false);
    }
  };

  const sendReply = async (event) => {
    event.preventDefault();
    const content = reply.trim();
    if (!content || !canReplyManually) return;
    setSending(true);
    try {
      const message = await hermesApi.reply(selectedId, content);
      setMessages((items) => [...items, message]);
      setReply("");
      setConversation((value) => ({
        ...value,
        updatedAt: new Date().toISOString(),
      }));
      setToast({ tone: "success", message: "Mensaje enviado por WhatsApp." });
      window.setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        30,
      );
      loadConversations();
    } catch (requestError) {
      const templateRequired =
        requestError?.code === "WHATSAPP_TEMPLATE_REQUIRED";
      setToast({
        tone: "error",
        message: templateRequired
          ? "La ventana de 24 horas se cerró. Debes usar una plantilla aprobada."
          : apiErrorMessage(requestError, "No se pudo enviar el mensaje."),
      });
      if (templateRequired) loadConversation(selectedId, true);
    } finally {
      setSending(false);
    }
  };

  const decidePayment = async (action) => {
    if (!transfer || action === 'approve' && !paymentReference.trim()) return;
    if (!window.confirm(action === 'approve' ? '¿Confirmar que el comprobante corresponde al pago?' : '¿Rechazar este comprobante?')) return;
    setActionLoading(true);
    try {
      if (action === 'approve') {
        const messageId = selectedProofId;
        await hermesApi.approveTransfer(transfer.id, { expectedStatus: transfer.status,
          reviewedProofMessageId: messageId, contractReference: paymentReference.trim(), reviewNote: paymentNote.trim() });
      } else {
        if (!paymentNote.trim()) throw new Error('Escribe el motivo del rechazo.');
        await hermesApi.rejectTransfer(transfer.id, { expectedStatus: transfer.status, reviewNote: paymentNote.trim() });
      }
      await Promise.all([loadConversation(selectedId, true), loadConversations(true)]);
      setToast({ tone: 'success', message: action === 'approve' ? 'Pago aprobado.' : 'Comprobante rechazado.' });
    } catch (requestError) {
      setToast({ tone: 'error', message: apiErrorMessage(requestError, 'No se pudo guardar la decisión.') });
    } finally { setActionLoading(false); }
  };

  const takeHandoff = async () => {
    const handoff = activeHandoff(conversation);
    if (!handoff) return;
    setActionLoading(true);
    try {
      await hermesApi.takeHandoff(handoff.id);
      await Promise.all([loadConversation(selectedId, true), loadConversations()]);
      setToast({ tone: "success", message: "La atención quedó asignada a ti." });
    } catch (requestError) {
      setToast({
        tone: "error",
        message: apiErrorMessage(requestError, "No se pudo tomar la atención."),
      });
      await Promise.all([loadConversation(selectedId, true), loadConversations(true)]);
    } finally {
      setActionLoading(false);
    }
  };

  const createHandoff = async (event) => {
    event.preventDefault();
    const conversationId = selectedId;
    const detail = takeoverDetail.trim();
    if (!conversationId || !detail || actionLoading) return;
    setActionLoading(true);
    try {
      await hermesApi.createHandoff(conversationId, takeoverReason, detail);
      setTakeoverOpen(false);
      setTakeoverDetail("");
      await Promise.all([loadConversation(conversationId, true), loadConversations(true)]);
      setToast({ tone: "success", message: "Control humano iniciado. Toma la atención para responder." });
    } catch (requestError) {
      setToast({
        tone: "error",
        message: apiErrorMessage(requestError, "No se pudo iniciar el control humano."),
      });
      await Promise.all([loadConversation(conversationId, true), loadConversations(true)]);
    } finally {
      setActionLoading(false);
    }
  };

  const closeConversation = async () => {
    if (!window.confirm("¿Cerrar esta conversación? Hermes dejará de responder.")) {
      return;
    }
    setActionLoading(true);
    try {
      await hermesApi.closeConversation(selectedId);
      await Promise.all([loadConversation(selectedId, true), loadConversations()]);
      setToast({ tone: "success", message: "Conversación cerrada." });
    } catch (requestError) {
      setToast({
        tone: "error",
        message: apiErrorMessage(requestError, "No se pudo cerrar la conversación."),
      });
    } finally {
      setActionLoading(false);
    }
  };

  const reopenConversation = async () => {
    setActionLoading(true);
    try {
      await hermesApi.reopenConversation(selectedId);
      await Promise.all([loadConversation(selectedId, true), loadConversations()]);
      setToast({
        tone: "success",
        message: "Conversación reabierta. Hermes vuelve a atender con el contexto previo.",
      });
    } catch (requestError) {
      setToast({
        tone: "error",
        message: apiErrorMessage(
          requestError,
          "No se pudo reabrir la conversación con Hermes.",
        ),
      });
    } finally {
      setActionLoading(false);
    }
  };

  const resolveHandoff = async (event) => {
    event.preventDefault();
    const handoff = activeHandoff(conversation);
    if (!handoff || !resolutionText.trim()) return;
    setActionLoading(true);
    try {
      await hermesApi.resolveHandoff(
        handoff.id,
        resolutionText.trim(),
        resolutionAction,
      );
      setResolutionOpen(false);
      setResolutionText("");
      await Promise.all([loadConversation(selectedId, true), loadConversations()]);
      const option = RESOLUTION_OPTIONS.find(
        (item) => item.value === resolutionAction,
      );
      setToast({
        tone: "success",
        message: `${option?.label || "Handoff actualizado"} correctamente.`,
      });
    } catch (requestError) {
      setToast({
        tone: "error",
        message: apiErrorMessage(requestError, "No se pudo resolver el handoff."),
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (listLoading && !conversations.length) {
    return <LoadingState label="Abriendo la bandeja de WhatsApp…" />;
  }
  if (listError && !conversations.length) {
    return <ErrorState message={listError} onRetry={() => loadConversations()} />;
  }

  const handoff = activeHandoff(conversation);
  const replyWindow = conversation?.replyWindow;
  const windowOpen = Boolean(
    replyWindow?.isOpen &&
    replyWindow.closesAt &&
    new Date(replyWindow.closesAt).getTime() > Date.now(),
  );
  const incidentPresentation = presentHermesIncident(
    conversation?.hermesIncident,
    conversation?.hermesReviewTask,
  );
  const canReplyManually = Boolean(
    conversation?.status === "HANDED_OFF" &&
      handoff &&
      handoff.status === "IN_PROGRESS" &&
      handoff.assignedAgentId === user?.id &&
      windowOpen,
  );

  return (
    <div className={`crm-inbox ${selectedId ? "has-selection" : ""}`}>
      <aside className="crm-inbox-list">
        <header className="crm-inbox-list-header">
          <div>
            <span className="crm-eyebrow">WhatsApp</span>
            <h1>Inbox</h1>
          </div>
          <button
            type="button"
            className="crm-icon-button"
            onClick={refreshAll}
            aria-label="Actualizar inbox"
          >
            <RefreshCw size={18} />
          </button>
        </header>

        <div className="crm-inbox-filters">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Buscar contacto…"
            label="Buscar conversaciones"
          />
          <div>
            <label>
              <span className="crm-sr-only">Estado</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVE">Hermes activo</option>
                <option value="HANDED_OFF">Control humano</option>
                <option value="PAUSED">Pausadas</option>
                <option value="CLOSED">Cerradas</option>
              </select>
            </label>
            <button
              type="button"
              className={priorityOnly ? "is-active" : ""}
              onClick={() => setPriorityOnly((value) => !value)}
              aria-pressed={priorityOnly}
            >
              <AlertTriangle size={15} />Prioridad
            </button>
          </div>
        </div>

        <div className="crm-inbox-list-meta">
          <span>{listMeta.total} conversaciones</span>
          {priorityOnly && <strong>Handoffs y pagos por revisar</strong>}
        </div>

        <div className="crm-conversation-list">
          {conversations.length === 0 ? (
            <EmptyState
              compact
              title="Sin conversaciones"
              description="No hay resultados para los filtros elegidos."
            />
          ) : (
            conversations.map((item) => {
              const itemHandoff = activeHandoff(item);
              return (
                <button
                  type="button"
                  key={item.id}
                  className={`${selectedId === item.id ? "is-active" : ""} ${
                    itemHandoff ? "is-priority" : ""
                  }`}
                  onClick={() => selectConversation(item.id)}
                >
                  <div className="crm-avatar">{initials(contactName(item.contact))}</div>
                  <div className="crm-conversation-list-copy">
                    <div>
                      <strong>{contactName(item.contact)}</strong>
                      <time>{relativeDate(item.updatedAt)}</time>
                    </div>
                    <p>{lastMessage(item)}</p>
                    <span>
                      {itemHandoff ? (
                        <><UserRoundCheck size={13} />Atención humana</>
                      ) : (
                        <><Bot size={13} />{CONVERSATION_STATUS[item.status] || item.status}</>
                      )}
                    </span>
                    {item.paymentReviewTask && <span>Comprobante por validar</span>}
                    {item.hermesIncident && (
                      <span className="crm-hermes-incident-chip">
                        <AlertTriangle size={13} />Incidencia de Hermes
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section className="crm-chat-panel">
        {!selectedId ? (
          <div className="crm-chat-placeholder">
            <div><Inbox size={30} /></div>
            <h2>Selecciona una conversación</h2>
            <p>Abre un contacto para revisar el historial y responder.</p>
          </div>
        ) : detailLoading ? (
          <LoadingState label="Cargando conversación…" />
        ) : detailError ? (
          <ErrorState
            message={detailError}
            onRetry={() => loadConversation(selectedId)}
          />
        ) : conversation ? (
          <>
            <header className="crm-chat-header">
              <button
                type="button"
                className="crm-icon-button crm-chat-back"
                onClick={() => {
                  setSelectedId("");
                  router.replace("/admin/crm/inbox", { scroll: false });
                }}
                aria-label="Volver a conversaciones"
              >
                <ArrowLeft size={19} />
              </button>
              <div className="crm-avatar">{initials(contactName(conversation.contact))}</div>
              <div className="crm-chat-contact">
                <strong>{contactName(conversation.contact)}</strong>
                <span><Phone size={13} />{contactPhone(conversation.contact)}</span>
              </div>
              <div className={`crm-conversation-status is-${conversation.status.toLowerCase()}`}>
                <i aria-hidden="true" />
                {CONVERSATION_STATUS[conversation.status] || conversation.status}
              </div>
              <div className="crm-chat-actions">
                {conversation.status === "CLOSED" ? (
                  <button
                    type="button"
                    className="crm-button is-primary crm-reopen-button"
                    onClick={reopenConversation}
                    disabled={actionLoading || Boolean(handoff)}
                    title={
                      handoff
                        ? "Resuelve el handoff abierto antes de devolver la conversación a Hermes"
                        : "Hermes vuelve a atender usando el contexto previo"
                    }
                  >
                    <RotateCcw size={15} />
                    Reabrir con Hermes
                  </button>
                ) : (
                  <button
                    type="button"
                    className="crm-icon-button"
                    onClick={closeConversation}
                    disabled={actionLoading || Boolean(handoff)}
                    aria-label="Cerrar conversación"
                    title={
                      handoff
                        ? "Resuelve el handoff para cerrar la conversación"
                        : "Cerrar conversación"
                    }
                  >
                    <MoreHorizontal size={20} />
                  </button>
                )}
              </div>
            </header>

            <div className="crm-conversation-lifecycle-note">
              <LockKeyhole size={14} />
              <span>
                <strong>Cerrar:</strong> Hermes deja de responder. <strong>Reabrir con Hermes:</strong>{" "}
                vuelve a atender usando el contexto previo.
              </span>
            </div>

            {incidentPresentation && (
              <section
                className={`crm-hermes-incident is-${incidentPresentation.tone}`}
                role={incidentPresentation.tone === "review" ? "alert" : "status"}
                aria-label="Incidencia de Hermes"
              >
                <AlertTriangle size={20} aria-hidden="true" />
                <div>
                  <header>
                    <strong>{incidentPresentation.categoryLabel}</strong>
                    <span>{incidentPresentation.statusLabel}</span>
                  </header>
                  <p>{incidentPresentation.summary}</p>
                  <footer>
                    {incidentPresentation.code && (
                      <code>{incidentPresentation.code}</code>
                    )}
                    <span>{incidentPresentation.attemptsLabel}</span>
                    {incidentPresentation.occurredAt && (
                      <time dateTime={incidentPresentation.occurredAt}>
                        {formatDate(incidentPresentation.occurredAt, {
                          withYear: true,
                        })}
                      </time>
                    )}
                  </footer>
                  {incidentPresentation.taskLabel && (
                    <div className="crm-hermes-review-task">
                      <Clock3 size={14} aria-hidden="true" />
                      {incidentPresentation.taskLabel}
                    </div>
                  )}
                </div>
              </section>
            )}

            {handoff && (
              <div className="crm-chat-handoff">
                <ShieldCheck size={19} />
                <div>
                  <strong>{HANDOFF_STATUS[handoff.status] || handoff.status}</strong>
                  <span>
                    {HANDOFF_REASON[handoff.reason] || handoff.reason}
                    {handoff.reasonDetail ? ` · ${handoff.reasonDetail}` : ""}
                  </span>
                </div>
                {(handoff.status === "PENDING" || (handoff.status === "ASSIGNED" && handoff.assignedAgentId === user?.id)) ? (
                  <button
                    type="button"
                    onClick={takeHandoff}
                    disabled={actionLoading}
                  >
                    <UserRoundCheck size={16} />Tomar atención
                  </button>
                ) : handoff.assignedAgentId === user?.id ? (
                  <button
                    type="button"
                    onClick={() => setResolutionOpen(true)}
                    disabled={actionLoading}
                  >
                    Resolver <ChevronDown size={15} />
                  </button>
                ) : (
                  <span>Asignado a {handoff.assignedAgent?.name || "otro operador"}</span>
                )}
              </div>
            )}

            {conversation.status === "ACTIVE" && !handoff && (
              <div className="crm-chat-handoff">
                <ShieldCheck size={19} />
                <div>
                  <strong>Hermes atiende esta conversación</strong>
                  <span>Inicia un handoff para atenderla desde Inbox.</span>
                </div>
                <button type="button" onClick={() => setTakeoverOpen(true)} disabled={actionLoading}>
                  <UserRoundCheck size={16} />Tomar control humano
                </button>
              </div>
            )}

            <div className="crm-message-history">
              {messagePage < messagePages && (
                <button
                  type="button"
                  className="crm-load-older"
                  onClick={loadOlderMessages}
                  disabled={loadingOlder}
                >
                  <ArrowDown size={15} />
                  {loadingOlder ? "Cargando…" : "Cargar mensajes anteriores"}
                </button>
              )}
              {messages.length === 0 ? (
                <EmptyState
                  compact
                  title="Sin mensajes"
                  description="Esta conversación todavía no tiene historial."
                />
              ) : (
                messages.map((message, index) => {
                  const sender = SENDER_META[message.sender] || SENDER_META.SYSTEM;
                  const showDay =
                    index === 0 ||
                    new Date(messages[index - 1].createdAt).toDateString() !==
                      new Date(message.createdAt).toDateString();
                  return (
                    <div key={message.id}>
                      {showDay && (
                        <div className="crm-message-day">
                          {formatDate(message.createdAt, {
                            withYear: true,
                            withTime: false,
                          })}
                        </div>
                      )}
                      <article className={`crm-message is-${sender.className}`}>
                        <div className="crm-message-sender">
                          {message.sender === "HERMES" && <Bot size={14} />}
                          {message.sender === "HUMAN" && <UserRound size={14} />}
                          {sender.label}
                          {message.sentByUser?.name && ` · ${message.sentByUser.name}`}
                        </div>
                        <p>{message.content || `[${message.type || "Mensaje"}]`}</p>
                        {message.sender === 'CONTACT' && ['IMAGE', 'DOCUMENT'].includes(message.type) &&
                          <InboxMedia conversationId={selectedId} message={message} />}
                        {transfer?.proofMessages?.some((proof) => proof.messageId === message.id) &&
                          <label><input type="radio" name="payment-proof" checked={selectedProofId === message.id}
                            onChange={() => setSelectedProofId(message.id)} /> Usar este comprobante para la decisión</label>}
                        <time>{formatDate(message.createdAt)}</time>
                      </article>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="crm-reply-box" onSubmit={sendReply}>
              {conversation.status === "CLOSED" ? (
                <div className="crm-reply-window is-closed">
                  <LockKeyhole size={15} />
                  Conversación cerrada. Reábrela para que Hermes vuelva a atender.
                </div>
              ) : handoff?.assignedAgentId && handoff.assignedAgentId !== user?.id ? (
                <div className="crm-reply-window is-closed">
                  <LockKeyhole size={15} />
                  La atención está asignada a otro operador.
                </div>
              ) : !handoff || handoff.status !== "IN_PROGRESS" ? (
                <div className="crm-reply-window is-closed">
                  <LockKeyhole size={15} />
                  La respuesta manual requiere un handoff tomado por un operador.
                </div>
              ) : windowOpen ? (
                <div className="crm-reply-window is-open">
                  <Clock3 size={15} />
                  Ventana abierta hasta {formatDate(replyWindow.closesAt)}
                </div>
              ) : (
                <div className="crm-reply-window is-closed">
                  <LockKeyhole size={15} />
                  Ventana de 24 horas cerrada. El texto libre está bloqueado.
                </div>
              )}
              <div className="crm-reply-compose">
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder={
                    canReplyManually
                      ? "Escribe una respuesta como operador…"
                      : conversation.status === "CLOSED"
                        ? "La conversación está cerrada"
                        : "Toma el handoff para responder manualmente"
                  }
                  maxLength={4096}
                  disabled={!canReplyManually || sending}
                  rows={2}
                  aria-label="Respuesta manual"
                />
                <button
                  type="submit"
                  className="crm-button is-primary"
                  disabled={!reply.trim() || !canReplyManually || sending}
                >
                  <Send size={17} />
                  {sending ? "Enviando…" : "Enviar"}
                </button>
              </div>
              {!windowOpen && conversation.status !== "CLOSED" && (
                <label className="crm-template-placeholder">
                  <span>Plantilla aprobada</span>
                  <select disabled>
                    <option>Se habilitará al configurar plantillas de Meta</option>
                  </select>
                </label>
              )}
            </form>
          </>
        ) : null}
      </section>

      <aside className="crm-context-panel">
        {conversation ? (
          <>
            <section>
              <span className="crm-context-label">Contacto</span>
              <div className="crm-context-profile">
                <div className="crm-avatar is-large">{initials(contactName(conversation.contact))}</div>
                <strong>{contactName(conversation.contact)}</strong>
                <span>{contactPhone(conversation.contact)}</span>
              </div>
              <dl className="crm-context-details">
                <div><dt>Canal</dt><dd>WhatsApp</dd></div>
                <div><dt>Inicio</dt><dd>{formatDate(conversation.createdAt, { withYear: true })}</dd></div>
                <div><dt>Mensajes</dt><dd>{conversation._count?.messages || messages.length}</dd></div>
              </dl>
            </section>

            <section>
              <span className="crm-context-label">Contexto de Hermes</span>
              <div className="crm-context-summary">
                <Bot size={18} />
                <p>{conversation.state?.summary || "Hermes aún no ha generado un resumen."}</p>
              </div>
              <dl className="crm-context-details">
                <div><dt>Intención</dt><dd>{conversation.state?.detectedIntent || "Sin detectar"}</dd></div>
                <div><dt>Objeción</dt><dd>{conversation.state?.lastObjection || "Ninguna"}</dd></div>
                <div><dt>Siguiente paso</dt><dd>{conversation.state?.nextSuggestedAction || "Sin sugerencia"}</dd></div>
              </dl>
            </section>

            {conversation.lead && (
              <section>
                <span className="crm-context-label">Oportunidad</span>
                <div className="crm-context-lead">
                  <StageBadge stage={conversation.lead.stage} meta={STAGE_META} />
                  <strong>{conversation.lead.productOfInterest || "Interés por definir"}</strong>
                  <Link href={`/admin/crm/leads/${conversation.lead.id}`}>
                    Ver ficha <ArrowUpRight size={15} />
                  </Link>
                </div>
              </section>
            )}

            {transfer && (
              <section className="crm-panel">
                <span className="crm-context-label">Transferencia bancaria</span>
                <p>Estado: <strong>{transfer.status}</strong></p>
                <p>Monto esperado: {transfer.currency} {transfer.amountExpected}</p>
                {transfer.proofMessages?.length > 0 && <p>{transfer.proofMessages.length} comprobante(s) en este chat. Revisa el último adjunto antes de decidir.</p>}
                {['PROOF_RECEIVED', 'UNDER_REVIEW'].includes(transfer.status) && (
                  <div>
                    {transfer.status === 'PROOF_RECEIVED' && <button type="button" className="crm-button is-secondary" disabled={actionLoading} onClick={async () => {
                      try { await hermesApi.startTransferReview(transfer.id); await loadConversation(selectedId, true); }
                      catch (error) { setToast({ tone: 'error', message: apiErrorMessage(error, 'No se pudo iniciar la revisión.') }); }
                    }}>Iniciar revisión</button>}
                    {user?.role === 'ADMIN' && <>
                      <label>Referencia de contrato<input value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} maxLength={128} /></label>
                      <label>Nota o motivo de rechazo<textarea value={paymentNote} onChange={(event) => setPaymentNote(event.target.value)} maxLength={2000} /></label>
                      <button type="button" className="crm-button is-primary" disabled={actionLoading || !paymentReference.trim() || !selectedProofId} onClick={() => decidePayment('approve')}>Aprobar pago</button>
                      <button type="button" className="crm-button is-secondary" disabled={actionLoading || !paymentNote.trim()} onClick={() => decidePayment('reject')}>Rechazar</button>
                    </>}
                  </div>
                )}
              </section>
            )}
          </>
        ) : (
          <div className="crm-context-placeholder">
            <MessageCircle size={23} />
            <span>El contexto del contacto aparecerá aquí.</span>
          </div>
        )}
      </aside>

      {takeoverOpen && conversation?.status === "ACTIVE" && !handoff && (
        <div className="crm-modal-backdrop" role="presentation">
          <div className="crm-modal" role="dialog" aria-modal="true" aria-labelledby="takeover-title">
            <header>
              <div>
                <span className="crm-eyebrow">Control humano</span>
                <h2 id="takeover-title">Tomar control humano</h2>
              </div>
              <button type="button" className="crm-icon-button" onClick={() => setTakeoverOpen(false)} aria-label="Cerrar">
                <X size={19} />
              </button>
            </header>
            <form onSubmit={createHandoff}>
              <label className="crm-resolution-note">
                <span>Motivo</span>
                <select value={takeoverReason} onChange={(event) => setTakeoverReason(event.target.value)}>
                  <option value="CUSTOM">Atención solicitada</option>
                  <option value="INFO_ERROR">Error de información</option>
                </select>
              </label>
              <label className="crm-resolution-note">
                <span>Detalle interno</span>
                <textarea value={takeoverDetail} onChange={(event) => setTakeoverDetail(event.target.value)}
                  placeholder="Explica por qué un operador atenderá este chat" maxLength={2000} required rows={4} />
              </label>
              <footer>
                <button type="button" className="crm-button is-secondary" onClick={() => setTakeoverOpen(false)}>Cancelar</button>
                <button type="submit" className="crm-button is-primary" disabled={actionLoading || !takeoverDetail.trim()}>
                  {actionLoading ? "Guardando…" : "Iniciar control humano"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {resolutionOpen && handoff && (
        <div className="crm-modal-backdrop" role="presentation">
          <div
            className="crm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resolution-title"
          >
            <header>
              <div>
                <span className="crm-eyebrow">Control humano</span>
                <h2 id="resolution-title">Finalizar atención</h2>
              </div>
              <button
                type="button"
                className="crm-icon-button"
                onClick={() => setResolutionOpen(false)}
                aria-label="Cerrar"
              >
                <X size={19} />
              </button>
            </header>
            <form onSubmit={resolveHandoff}>
              <div className="crm-resolution-options">
                {RESOLUTION_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <label
                      key={option.value}
                      className={resolutionAction === option.value ? "is-selected" : ""}
                    >
                      <input
                        type="radio"
                        name="resolutionAction"
                        value={option.value}
                        checked={resolutionAction === option.value}
                        onChange={() => setResolutionAction(option.value)}
                      />
                      <Icon size={19} />
                      <span><strong>{option.label}</strong><small>{option.description}</small></span>
                    </label>
                  );
                })}
              </div>
              <label className="crm-resolution-note">
                <span>Resumen de la atención</span>
                <textarea
                  value={resolutionText}
                  onChange={(event) => setResolutionText(event.target.value)}
                  placeholder="Describe qué se acordó con el cliente…"
                  maxLength={2000}
                  required
                  rows={4}
                />
              </label>
              <footer>
                <button
                  type="button"
                  className="crm-button is-secondary"
                  onClick={() => setResolutionOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="crm-button is-primary"
                  disabled={actionLoading || !resolutionText.trim()}
                >
                  {actionLoading ? "Guardando…" : "Confirmar acción"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      <Toast
        message={toast?.message}
        tone={toast?.tone}
        onDismiss={() => setToast(null)}
      />
    </div>
  );
}
