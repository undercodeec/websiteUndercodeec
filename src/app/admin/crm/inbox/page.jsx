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
import { hermesApi } from "@/lib/hermes/api";
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

export default function InboxPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialConversationId = searchParams.get("conversationId") || "";
  const initialPriority = searchParams.get("priorityOnly") === "true";
  const [conversations, setConversations] = useState([]);
  const [listMeta, setListMeta] = useState({ total: 0, totalPages: 1 });
  const [selectedId, setSelectedId] = useState(initialConversationId);
  const [conversation, setConversation] = useState(null);
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
  const [resolutionAction, setResolutionAction] = useState("RETURN_TO_HERMES");
  const [resolutionText, setResolutionText] = useState("");
  const [toast, setToast] = useState(null);
  const messagesEndRef = useRef(null);

  const loadConversations = useCallback(async () => {
    setListLoading(true);
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
      setListLoading(false);
    }
  }, [deferredSearch, priorityOnly, statusFilter]);

  const loadConversation = useCallback(async (id, quiet = false) => {
    if (!id) {
      setConversation(null);
      setMessages([]);
      return;
    }
    if (!quiet) setDetailLoading(true);
    setDetailError("");
    try {
      const [detail, history] = await Promise.all([
        hermesApi.conversation(id),
        hermesApi.messages(id, { page: 1, limit: 50 }),
      ]);
      setConversation(detail);
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

  const selectConversation = (id) => {
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
    if (!content || !conversation?.replyWindow?.isOpen) return;
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
    return <ErrorState message={listError} onRetry={loadConversations} />;
  }

  const handoff = activeHandoff(conversation);
  const replyWindow = conversation?.replyWindow;

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
          {priorityOnly && <strong>Handoffs primero</strong>}
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
              <button
                type="button"
                className="crm-icon-button"
                onClick={closeConversation}
                disabled={actionLoading || conversation.status === "CLOSED"}
                aria-label="Cerrar conversación"
                title="Cerrar conversación"
              >
                <MoreHorizontal size={20} />
              </button>
            </header>

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
                {handoff.status === "PENDING" ? (
                  <button
                    type="button"
                    onClick={takeHandoff}
                    disabled={actionLoading}
                  >
                    <UserRoundCheck size={16} />Tomar atención
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setResolutionOpen(true)}
                    disabled={actionLoading}
                  >
                    Resolver <ChevronDown size={15} />
                  </button>
                )}
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
                        <time>{formatDate(message.createdAt)}</time>
                      </article>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="crm-reply-box" onSubmit={sendReply}>
              {replyWindow?.isOpen ? (
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
                    replyWindow?.isOpen
                      ? "Escribe una respuesta como operador…"
                      : "Se requiere una plantilla aprobada por Meta"
                  }
                  maxLength={4096}
                  disabled={!replyWindow?.isOpen || sending}
                  rows={2}
                  aria-label="Respuesta manual"
                />
                <button
                  type="submit"
                  className="crm-button is-primary"
                  disabled={!reply.trim() || !replyWindow?.isOpen || sending}
                >
                  <Send size={17} />
                  {sending ? "Enviando…" : "Enviar"}
                </button>
              </div>
              {!replyWindow?.isOpen && (
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
          </>
        ) : (
          <div className="crm-context-placeholder">
            <MessageCircle size={23} />
            <span>El contexto del contacto aparecerá aquí.</span>
          </div>
        )}
      </aside>

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
