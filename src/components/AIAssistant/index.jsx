"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { RiRobot2Line, RiCloseLine, RiSendPlaneFill, RiMicFill, RiMicOffFill, RiVolumeUpFill, RiVolumeMuteFill, RiChat3Line } from 'react-icons/ri';
import VimeoFacade from '@/components/Vimeo/VimeoFacade';

const CHAT_AUTH_TOKEN_KEY = 'undercodeec_chat_auth_token';
const CHAT_USER_KEY = 'undercodeec_chat_user';
const CHAT_LAST_ACTIVITY_KEY = 'undercodeec_chat_last_activity';
const CHAT_SESSION_ID_KEY = 'undercodeec_chat_session_id';
const CHAT_IDLE_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_CHAT_IDLE_TIMEOUT_MS) || (30 * 60 * 1000);

const AIAssistant = () => {
    const pathname = usePathname();
    const isHiddenPath = pathname?.startsWith('/admin') || pathname?.startsWith('/contratos') || pathname?.startsWith('/recursos-humanos');
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [chatModeSelected, setChatModeSelected] = useState(false);
    const [chatMode, setChatMode] = useState(null); // 'ia' | 'bot'
    const [pendingVerifyEmail, setPendingVerifyEmail] = useState('');
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showLeadCapture, setShowLeadCapture] = useState(false);
    const [leadForm, setLeadForm] = useState({ name: '', phone: '', email: '', projectType: '' });
    const [isSubmittingLead, setIsSubmittingLead] = useState(false);
    const [showChatAuth, setShowChatAuth] = useState(false);
    const [chatAuthMode, setChatAuthMode] = useState('register');
    const [chatAuthForm, setChatAuthForm] = useState({ name: '', email: '', phone: '', password: '', code: '' });
    const [isSubmittingChatAuth, setIsSubmittingChatAuth] = useState(false);
    const [chatUser, setChatUser] = useState(null);
    const [remainingAIRequests, setRemainingAIRequests] = useState(null);
    const [chatAccessTier, setChatAccessTier] = useState('public');
    const chatSessionIdRef = useRef(null);
    const hasTrackedAIConversationStartRef = useRef(false);

    const appendAssistantMessage = useCallback((content) => {
        setMessages(prev => [...prev, { role: 'assistant', content, streaming: false }]);
    }, []);

    const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';

    const trackPixelEvent = (eventName, parameters = {}) => {
        if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
            window.fbq('trackCustom', eventName, {
                source: 'ai_assistant',
                page_path: pathname || '/',
                ...parameters,
            });
        }
    };

    const markChatActivity = useCallback(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(CHAT_LAST_ACTIVITY_KEY, String(Date.now()));
    }, []);

    const isStoredChatSessionIdle = useCallback(() => {
        if (typeof window === 'undefined' || !CHAT_IDLE_TIMEOUT_MS || CHAT_IDLE_TIMEOUT_MS <= 0) return false;
        const hasSession = !!(localStorage.getItem(CHAT_AUTH_TOKEN_KEY) || localStorage.getItem(CHAT_USER_KEY));
        if (!hasSession) return false;
        const lastActivity = Number(localStorage.getItem(CHAT_LAST_ACTIVITY_KEY) || 0);
        if (!Number.isFinite(lastActivity) || lastActivity <= 0) return false;
        return Date.now() - lastActivity > CHAT_IDLE_TIMEOUT_MS;
    }, []);

    const clearChatAuthSession = useCallback((message) => {
        if (typeof window !== 'undefined') {
            fetch(`${getApiBaseUrl()}/api/chat/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            }).catch(() => {});
            localStorage.removeItem(CHAT_AUTH_TOKEN_KEY);
            localStorage.removeItem(CHAT_USER_KEY);
            localStorage.removeItem(CHAT_LAST_ACTIVITY_KEY);
        }
        setChatUser(null);
        setChatAccessTier('public');
        setRemainingAIRequests(null);
        if (chatMode === 'ia') {
            setShowChatAuth(true);
            setChatAuthMode('login');
            setChatModeSelected(false);
        }
        if (message) appendAssistantMessage(message);
    }, [appendAssistantMessage, chatMode]);

    const createSecureChatSessionId = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return `chat_${crypto.randomUUID().replace(/-/g, '')}`;
        }
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            const values = crypto.getRandomValues(new Uint32Array(4));
            return `chat_${Array.from(values, value => value.toString(36)).join('')}`;
        }
        return `chat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
    };

    const getChatSessionId = () => {
        if (chatSessionIdRef.current) return chatSessionIdRef.current;
        let sessionId = localStorage.getItem(CHAT_SESSION_ID_KEY);
        if (!sessionId) {
            sessionId = createSecureChatSessionId();
            localStorage.setItem(CHAT_SESSION_ID_KEY, sessionId);
        }
        chatSessionIdRef.current = sessionId;
        return sessionId;
    };

    const updateRemainingAIRequests = (response) => {
        const remaining = response.headers.get('X-Chat-Remaining-Today');
        const tier = response.headers.get('X-Chat-Access-Tier');
        if (remaining !== null) {
            const value = Number(remaining);
            if (Number.isFinite(value)) setRemainingAIRequests(value);
        }
        if (tier) setChatAccessTier(tier);
    };

    const getChatAuthToken = () => {
        if (typeof window === 'undefined') return '';
        if (isStoredChatSessionIdle()) {
            clearChatAuthSession('Tu sesion del Asistente IA se cerro por inactividad. Inicia sesion nuevamente para continuar.');
            return '';
        }
        return localStorage.getItem(CHAT_AUTH_TOKEN_KEY) || '';
    };

    const buildChatHeaders = () => {
        const headers = { 'Content-Type': 'application/json' };
        // Compatibilidad temporal para sesiones antiguas; las sesiones nuevas usan cookie HttpOnly.
        const token = getChatAuthToken();
        if (token) headers.Authorization = `Bearer ${token}`;
        return headers;
    };

    // Typewriter effect state
    // Maps message index -> how many characters have been revealed so far
    const [revealedChars, setRevealedChars] = useState({});
    const typewriterTimers = useRef({});
    const TYPEWRITER_SPEED = 18; // ms per character (lower = faster)
    
    // Voice Chat States
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const currentTTSAudioRef = useRef(null);

    // Speech Recognition Setup
    const finalTranscriptRef = useRef('');

    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'es-419'; // Español Latinoamérica general (mejor precisión)
            recognitionRef.current.maxAlternatives = 3;

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                let finalChunk = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalChunk += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                if (finalChunk) {
                    finalTranscriptRef.current += (finalTranscriptRef.current ? ' ' : '') + finalChunk;
                }
                setInputValue(finalTranscriptRef.current + interimTranscript);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (isStoredChatSessionIdle()) {
            clearChatAuthSession();
            return;
        }
        const storedUser = localStorage.getItem(CHAT_USER_KEY);
        if (storedUser) {
            try {
                setChatUser(JSON.parse(storedUser));
                setChatAccessTier('registered_user');
            } catch {
                localStorage.removeItem(CHAT_USER_KEY);
            }
        }
    }, [clearChatAuthSession, isStoredChatSessionIdle]);

    useEffect(() => {
        if (typeof window === 'undefined' || !chatUser) return;

        const expireIfIdle = () => {
            if (isStoredChatSessionIdle()) {
                clearChatAuthSession('Tu sesion del Asistente IA se cerro por inactividad. Inicia sesion nuevamente para continuar.');
            }
        };

        const intervalId = window.setInterval(expireIfIdle, 30000);
        const handleStorage = (event) => {
            if ([CHAT_AUTH_TOKEN_KEY, CHAT_USER_KEY, CHAT_LAST_ACTIVITY_KEY].includes(event.key)) {
                expireIfIdle();
            }
        };
        window.addEventListener('storage', handleStorage);
        expireIfIdle();

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('storage', handleStorage);
        };
    }, [chatUser, chatMode, clearChatAuthSession, isStoredChatSessionIdle]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            finalTranscriptRef.current = '';
            setInputValue('');
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (err) {
                console.error("Microphone error", err);
            }
        }
    };

    // Play Notification Sound
    const playNotificationSound = () => {
        try {
            const audio = new Audio('/pop.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Audio autoplay prevented by browser', e));
        } catch (error) {
            console.error('Error playing sound', error);
        }
    };

    // Sincronizar con el botón de mute global (AudioMuteButton)
    useEffect(() => {
        const handleGlobalMuteChange = () => {
            const isMuted = localStorage.getItem('isGlobalMuted') === 'true';
            if (isMuted) {
                setIsAudioEnabled(false);
                if (currentTTSAudioRef.current && !currentTTSAudioRef.current.paused) {
                    currentTTSAudioRef.current.pause();
                    currentTTSAudioRef.current.currentTime = 0;
                }
            }
        };
        window.addEventListener('storage', handleGlobalMuteChange);
        return () => window.removeEventListener('storage', handleGlobalMuteChange);
    }, []);

    // PERF: fetch TTS en paralelo después de mostrar el texto.
    // El backend ya no bloquea la respuesta del chat con la síntesis de voz.
    const fetchAndPlayTTS = async (text) => {
        if (localStorage.getItem('isGlobalMuted') === 'true') return;
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';
            const ttsRes = await fetch(`${baseUrl}/api/chat/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });
            const ttsData = await ttsRes.json();
            if (ttsData.audio_base64) {
                const audio = new Audio("data:audio/mp3;base64," + ttsData.audio_base64);
                audio.volume = 0.9;
                currentTTSAudioRef.current = audio;
                audio.play().catch(e => console.log('Audio autoplay prevented by browser', e));
            }
        } catch (e) {
            console.error('Error fetching TTS audio:', e);
        }
    };

    // Typewriter reveal: when a message's full content changes or finishes streaming,
    // start revealing characters one by one.
    const startTypewriter = useCallback((msgIndex, fullLength) => {
        // Clear any existing timer for this index
        if (typewriterTimers.current[msgIndex]) {
            clearInterval(typewriterTimers.current[msgIndex]);
        }
        const currentRevealed = revealedChars[msgIndex] || 0;
        if (currentRevealed >= fullLength) return;

        typewriterTimers.current[msgIndex] = setInterval(() => {
            setRevealedChars(prev => {
                const current = prev[msgIndex] || 0;
                if (current >= fullLength) {
                    clearInterval(typewriterTimers.current[msgIndex]);
                    delete typewriterTimers.current[msgIndex];
                    return prev;
                }
                // Reveal 1-3 chars at a time for natural speed variation
                const step = Math.random() > 0.7 ? 2 : 1;
                return { ...prev, [msgIndex]: Math.min(current + step, fullLength) };
            });
        }, TYPEWRITER_SPEED);
    }, [revealedChars]);

    // Watch for new assistant messages and trigger typewriter
    useEffect(() => {
        const activeTimers = typewriterTimers.current;
        messages.forEach((msg, idx) => {
            if (msg.role === 'assistant' && msg.content) {
                const revealed = revealedChars[idx] || 0;
                if (revealed < msg.content.length) {
                    startTypewriter(idx, msg.content.length);
                }
            }
        });
        // Cleanup on unmount
        return () => {
            Object.values(activeTimers).forEach(clearInterval);
        };
    }, [messages, revealedChars, startTypewriter]);

    // Consume el stream SSE de /api/chat. Inserta el mensaje del asistente al
    // primer delta (no antes — para que el indicador "Pensando..." no conviva
    // con un bubble vacío) y lo va actualizando.
    const consumeChatStream = async (response) => {
        if (!response.body) throw new Error('Sin stream del backend');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulated = '';
        let inserted = false;

        const applyDelta = (delta) => {
            accumulated += delta;
            if (!inserted) {
                inserted = true;
                setMessages(prev => [...prev, { role: 'assistant', content: accumulated, streaming: true }]);
            } else {
                setMessages(prev => {
                    const next = [...prev];
                    const last = next[next.length - 1];
                    if (last && last.role === 'assistant') {
                        next[next.length - 1] = { ...last, content: accumulated, streaming: true };
                    }
                    return next;
                });
            }
        };

        const finalize = () => {
            if (!inserted) return;
            setMessages(prev => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last && last.role === 'assistant') {
                    next[next.length - 1] = { ...last, streaming: false };
                }
                return next;
            });
        };

        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                let idx;
                while ((idx = buffer.indexOf('\n\n')) !== -1) {
                    const rawEvent = buffer.slice(0, idx);
                    buffer = buffer.slice(idx + 2);
                    const lines = rawEvent.split('\n').filter(l => l.startsWith('data: '));
                    for (const line of lines) {
                        const dataStr = line.slice(6);
                        if (dataStr === '[DONE]') {
                            finalize();
                            return accumulated;
                        }
                        try {
                            const payload = JSON.parse(dataStr);
                            if (payload.type === 'text' && payload.delta) {
                                applyDelta(payload.delta);
                            } else if (payload.type === 'error') {
                                throw new Error(payload.message || 'Error del servidor');
                            }
                        } catch (e) {
                            console.error('SSE parse error:', e, dataStr);
                        }
                    }
                }
            }
            finalize();
            return accumulated;
        } catch (e) {
            finalize();
            if (!accumulated) {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error.', streaming: false }]);
            }
            throw e;
        }
    };
    
    // Quick Replies Suggestions
    const [showSuggestions, setShowSuggestions] = useState(true);
    const suggestions = [
        "Quiero cotizar un proyecto nuevo",
        "Necesito modernizar mi web actual",
        "Quiero mejorar mi SEO o aparecer en Google",
        "Deseo comunicarme con un asesor humano"
    ];
    const handleSuggestionClick = (text) => {
        handleSendMessage(text);
        setShowSuggestions(false);
    };

    // Al autenticar/verificar con exito: guarda sesion y, si el usuario eligio IA,
    // arranca la conversacion con el asesor personal.
    const onChatAuthSuccess = (data) => {
        trackPixelEvent('FormularioAsistenteIAEnviado', { form_type: 'chat_access' });
        if (data.token) {
            localStorage.removeItem(CHAT_AUTH_TOKEN_KEY);
            markChatActivity();
        }
        if (data.user) {
            localStorage.setItem(CHAT_USER_KEY, JSON.stringify(data.user));
            setChatUser(data.user);
        }
        if (data.accessTier) setChatAccessTier(data.accessTier);
        setShowChatAuth(false);
        setShowLeadCapture(false);
        setPendingVerifyEmail('');
        setChatAuthForm(prev => ({ ...prev, password: '', code: '' }));
        if (chatMode === 'ia') {
            setChatModeSelected(true);
            setShowSuggestions(false);
            sendGreeting('ia');
        } else {
            appendAssistantMessage(data.message || 'Sesion activada.');
        }
    };

    const submitChatAuth = async () => {
        if (chatAuthMode === 'verify') return submitChatVerify();
        if (!chatAuthForm.email.trim() || !chatAuthForm.password.trim() || (chatAuthMode === 'register' && !chatAuthForm.name.trim())) {
            appendAssistantMessage(chatAuthMode === 'register'
                ? 'Para registrarte necesito nombre, email y clave.'
                : 'Para iniciar sesion necesito email y clave.');
            return;
        }

        setIsSubmittingChatAuth(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';
            const response = await fetch(`${baseUrl}/api/chat/auth/${chatAuthMode}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...chatAuthForm,
                    sessionId: getChatSessionId(),
                }),
            });
            updateRemainingAIRequests(response);
            const data = await response.json().catch(() => ({}));
            // Cuenta creada o login sin verificar: pasar al paso de codigo.
            if (data.requiresVerification) {
                setPendingVerifyEmail(data.email || chatAuthForm.email.trim());
                setChatAuthMode('verify');
                appendAssistantMessage(data.message || data.error || 'Te enviamos un codigo de 6 digitos a tu correo. Ingresalo para activar tu Asistente IA.');
                return;
            }
            if (!response.ok) {
                appendAssistantMessage(data.error || 'No pude activar tu cuenta del asistente.');
                return;
            }
            onChatAuthSuccess(data);
        } catch (error) {
            console.error('Error authenticating chat user:', error);
            appendAssistantMessage('No pude activar tu cuenta ahora. Puedes dejar tus datos o continuar por WhatsApp.');
        } finally {
            setIsSubmittingChatAuth(false);
        }
    };

    const submitChatVerify = async () => {
        const email = (pendingVerifyEmail || chatAuthForm.email).trim();
        if (!email || !/^\d{6}$/.test(chatAuthForm.code.trim())) {
            appendAssistantMessage('Ingresa el codigo de 6 digitos que enviamos a tu correo.');
            return;
        }
        setIsSubmittingChatAuth(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';
            const response = await fetch(`${baseUrl}/api/chat/auth/verify`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: chatAuthForm.code.trim(), sessionId: getChatSessionId() }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                appendAssistantMessage(data.error || 'Codigo invalido o expirado. Solicita uno nuevo.');
                return;
            }
            onChatAuthSuccess(data);
        } catch (error) {
            console.error('Error verifying chat user:', error);
            appendAssistantMessage('No pude verificar el codigo ahora. Intenta de nuevo en un momento.');
        } finally {
            setIsSubmittingChatAuth(false);
        }
    };

    const submitChatForgot = async () => {
        if (!chatAuthForm.email.trim()) {
            appendAssistantMessage('Escribe tu email para enviarte el codigo de recuperacion.');
            return;
        }
        setIsSubmittingChatAuth(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';
            const response = await fetch(`${baseUrl}/api/chat/auth/forgot`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: chatAuthForm.email }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                appendAssistantMessage(data.error || 'No pude enviar el codigo de recuperacion.');
                return;
            }
            setChatAuthMode('reset');
            appendAssistantMessage(data.message || 'Si el email existe, te enviamos un codigo. Revisa tu correo e ingresalo aqui.');
        } catch (error) {
            console.error('Error requesting password reset:', error);
            appendAssistantMessage('No pude enviar el codigo ahora. Intenta de nuevo en un momento.');
        } finally {
            setIsSubmittingChatAuth(false);
        }
    };

    const submitChatReset = async () => {
        if (!chatAuthForm.email.trim() || !/^\d{6}$/.test(chatAuthForm.code.trim()) || chatAuthForm.password.length < 6) {
            appendAssistantMessage('Necesito tu email, el codigo de 6 digitos y una nueva clave de minimo 6 caracteres.');
            return;
        }
        setIsSubmittingChatAuth(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';
            const response = await fetch(`${baseUrl}/api/chat/auth/reset`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: chatAuthForm.email,
                    code: chatAuthForm.code.trim(),
                    password: chatAuthForm.password,
                    sessionId: getChatSessionId(),
                }),
            });
            updateRemainingAIRequests(response);
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                appendAssistantMessage(data.error || 'No pude restablecer tu contrasena.');
                return;
            }
            if (data.token) {
                localStorage.removeItem(CHAT_AUTH_TOKEN_KEY);
                markChatActivity();
            }
            if (data.user) {
                localStorage.setItem(CHAT_USER_KEY, JSON.stringify(data.user));
                setChatUser(data.user);
            }
            if (data.accessTier) setChatAccessTier(data.accessTier);
            if (Number.isFinite(Number(data.remainingToday))) setRemainingAIRequests(Number(data.remainingToday));
            setChatAuthForm({ name: '', email: '', phone: '', password: '', code: '' });
            setShowChatAuth(false);
            setShowLeadCapture(false);
            appendAssistantMessage(data.message || 'Contrasena actualizada. Ya iniciaste sesion.');
        } catch (error) {
            console.error('Error resetting password:', error);
            appendAssistantMessage('No pude restablecer tu contrasena ahora. Intenta de nuevo en un momento.');
        } finally {
            setIsSubmittingChatAuth(false);
        }
    };

    const submitLeadCapture = async () => {
        if (!leadForm.name.trim() || !leadForm.phone.trim() || !leadForm.projectType.trim()) {
            appendAssistantMessage('Para continuar necesito tu nombre, WhatsApp y tipo de proyecto.');
            return;
        }

        setIsSubmittingLead(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';
            const response = await fetch(`${baseUrl}/api/chat/lead`, {
                method: 'POST',
                credentials: 'include',
                headers: buildChatHeaders(),
                body: JSON.stringify({
                    ...leadForm,
                    sessionId: getChatSessionId(),
                    message: messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n'),
                    source: 'ai_assistant_limit_form',
                }),
            });
            updateRemainingAIRequests(response);
            const data = await response.json().catch(() => ({}));
            if (data.accessTier) setChatAccessTier(data.accessTier);
            if (Number.isFinite(Number(data.remainingToday))) setRemainingAIRequests(Number(data.remainingToday));
            appendAssistantMessage(data.message || data.error || 'Recibimos tus datos. Un asesor continuara contigo.');
            if (response.ok) {
                trackPixelEvent('FormularioAsistenteIAEnviado', { form_type: 'lead_capture' });
                setShowLeadCapture(false);
                setLeadForm({ name: '', phone: '', email: '', projectType: '' });
            }
        } catch (error) {
            console.error('Error submitting chat lead:', error);
            appendAssistantMessage('No pude guardar tus datos ahora. Puedes continuar directamente por WhatsApp.');
        } finally {
            setIsSubmittingLead(false);
        }
    };
    
    // Highlight effect states removed
    const showHighlight = false;

    const dismissHighlight = () => {};

    // Envia el saludo inicial del backend segun el modo elegido (ia | bot).
    const sendGreeting = async (mode) => {
        setIsLoading(true);
        try {
            if (mode === 'ia') markChatActivity();
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';
            const backendUrl = `${baseUrl}/api/chat`;

            const response = await fetch(backendUrl, {
                method: 'POST',
                credentials: 'include',
                headers: buildChatHeaders(),
                body: JSON.stringify({ message: 'SALUDO_INICIAL', sessionId: getChatSessionId(), mode }),
            });
            updateRemainingAIRequests(response);

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                if (response.status === 401 && data.sessionExpired) {
                    clearChatAuthSession(data.error || 'Tu sesion del Asistente IA se cerro por inactividad. Inicia sesion nuevamente para continuar.');
                    return;
                }
                appendAssistantMessage(data.cta || data.error || 'No pude iniciar el asistente en este momento.');
                return;
            }
            if (mode === 'ia') {
                markChatActivity();
                if (!hasTrackedAIConversationStartRef.current) {
                    trackPixelEvent('InicioConversacionAsistenteIA');
                    hasTrackedAIConversationStartRef.current = true;
                }
            }

            const fullText = await consumeChatStream(response);

            if (fullText) {
                if (isAudioEnabled && mode === 'ia') {
                    fetchAndPlayTTS(fullText);
                } else {
                    playNotificationSound();
                }
            }
        } catch (error) {
            console.error('Error sending init message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // El usuario elige entre Asistente IA (requiere registro + correo verificado)
    // y ChatBot automatico (sin registro, sin modelo).
    const selectChatMode = (mode) => {
        setChatMode(mode);
        setChatModeSelected(true);
        if (mode === 'ia') {
            if (chatUser && chatUser.emailVerified) {
                markChatActivity();
                setShowSuggestions(false);
                sendGreeting('ia');
            } else {
                // Falta registrarse o verificar el correo antes de usar la IA.
                setChatAuthMode(chatUser ? 'login' : 'register');
                setShowChatAuth(true);
            }
        } else {
            setShowSuggestions(true);
            sendGreeting('bot');
        }
    };

    const toggleChat = () => {
        dismissHighlight();
        if (!isOpen) {
            trackPixelEvent('ClickAsistenteIA');
        }
        setIsOpen(!isOpen);
    };

    const handleSendMessage = async (customMessage = null) => {
        const textToSend = customMessage || inputValue;
        if (!textToSend.trim()) return;
        if (chatMode === 'ia') markChatActivity();

        const userMessage = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMessage]);
        if (!customMessage) setInputValue('');
        setIsLoading(true);
        setShowSuggestions(false);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';
            const backendUrl = `${baseUrl}/api/chat`;

            const response = await fetch(backendUrl, {
                method: 'POST',
                credentials: 'include',
                headers: buildChatHeaders(),
                body: JSON.stringify({
                    sessionId: getChatSessionId(),
                    message: userMessage.content,
                    history: [...messages, userMessage],
                    mode: chatMode,
                }),
            });
            updateRemainingAIRequests(response);

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                if (response.status === 401 && data.sessionExpired) {
                    clearChatAuthSession(data.error || 'Tu sesion del Asistente IA se cerro por inactividad. Inicia sesion nuevamente para continuar.');
                    return;
                }
                appendAssistantMessage(data.cta || data.error || 'No pude procesar tu mensaje. Intenta nuevamente.');
                // El Asistente IA requiere registro + correo verificado.
                if (response.status === 401 || data.requiresAuth || data.requiresVerification) {
                    setChatAuthMode(data.requiresVerification ? 'verify' : (chatUser ? 'login' : 'register'));
                    if (data.email) setPendingVerifyEmail(data.email);
                    setShowChatAuth(true);
                }
                return;
            }

            const fullText = await consumeChatStream(response);
            if (chatMode === 'ia') markChatActivity();

            if (fullText) {
                if (isAudioEnabled) {
                    fetchAndPlayTTS(fullText);
                } else {
                    playNotificationSound();
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const openPayPhoneCheckout = (paymentUrlWithContext) => {
        const parsedUrl = new URL(paymentUrlWithContext);
        const context = new URLSearchParams(parsedUrl.hash.slice(1));
        const clientTransactionId = context.get('uctx');
        const paymentSessionToken = context.get('utoken');
        parsedUrl.hash = '';

        const width = 500;
        const height = 700;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        const paymentWindow = window.open(
            parsedUrl.toString(),
            'PayPhoneCheckout',
            `width=${width},height=${height},left=${left},top=${top},status=yes,scrollbars=yes`
        );

        if (!paymentWindow) {
            appendAssistantMessage('No pude abrir la ventana de pago. Habilita las ventanas emergentes e inténtalo nuevamente.');
            return;
        }

        const allowedOrigins = [
            'https://pay.payphonetodoesposible.com',
            'https://api.undercodeec.com',
            window.location.origin,
        ];
        let pollingTimer = null;
        let pollingTicks = 0;
        let requestInFlight = false;
        let finished = false;

        const cleanup = () => {
            window.removeEventListener('message', handlePaymentMessage);
            if (pollingTimer) clearInterval(pollingTimer);
        };

        const markApproved = () => {
            if (finished) return;
            finished = true;
            cleanup();
            if (!paymentWindow.closed) paymentWindow.close();
            appendAssistantMessage('✅ ¡He confirmado tu pago exitosamente! En breve recibirás los correos con tu recibo y acceso a Google Drive.');
        };

        const checkPaymentStatus = async () => {
            if (finished || requestInFlight || !clientTransactionId || !paymentSessionToken) return false;
            requestInFlight = true;
            try {
                const response = await fetch(
                    `${getApiBaseUrl()}/api/check-payment-status/${encodeURIComponent(clientTransactionId)}`,
                    { headers: { Authorization: `Bearer ${paymentSessionToken}` } }
                );
                if (!response.ok) return false;
                const status = await response.json();
                if (status.success && status.status === 'Approved') {
                    markApproved();
                    return true;
                }
            } catch (error) {
                console.error('Error consultando el estado de PayPhone:', error);
            } finally {
                requestInFlight = false;
            }
            return false;
        };

        async function handlePaymentMessage(event) {
            if (event.source !== paymentWindow || !allowedOrigins.includes(event.origin)) return;
            if (event.data?.type === 'PAYMENT_COMPLETED') await checkPaymentStatus();
        }

        window.addEventListener('message', handlePaymentMessage);
        void checkPaymentStatus();
        pollingTimer = setInterval(async () => {
            if (requestInFlight || finished) return;
            pollingTicks += 1;

            if (pollingTicks >= 300) {
                finished = true;
                cleanup();
                appendAssistantMessage('La verificación del pago agotó el tiempo de espera. Si completaste el pago, revisa tu correo o contáctanos para validarlo.');
                return;
            }

            const approved = await checkPaymentStatus();
            if (approved || finished) return;

            if (paymentWindow.closed) {
                finished = true;
                cleanup();
                appendAssistantMessage('La ventana de pago se cerró. Si el pago fue aprobado, recibirás la confirmación por correo; de lo contrario puedes intentarlo nuevamente.');
            }
        }, 2000);
    };

    // Custom text parser for WhatsApp Buttons, Bold text, and PayPhone Links.
    // Durante streaming, los patrones [wa-button]... incompletos se ocultan
    // para que el lector no vea código a medio escribir.
    const renderMessageContent = (content, isStreaming = false) => {
        if (typeof content !== 'string') return content;

        if (isStreaming) {
            // Oculta cualquier [wa-button] que aún no haya cerrado con `)`
            content = content.replace(/\[wa-button\][^\n]*?(?:\)|$)/g, (m) => m.endsWith(')') ? m : '');
        }

        // 1. Check for [wa-button]Text:(url)
        const waRegex = /\[wa-button\](.*?):\((https:\/\/wa\.me\/[^\)]+)\)/;
        const waMatch = content.match(waRegex);

        let processedContent = content;
        let whatsappButton = null;

        if (waMatch) {
            processedContent = processedContent.replace(waRegex, '').trim();
            const btnText = waMatch[1];
            let btnUrl = waMatch[2];
            // Auto-encode the text= parameter if it contains unencoded chars
            const textParamMatch = btnUrl.match(/(\?text=)(.*)/);
            if (textParamMatch) {
                const base = btnUrl.substring(0, btnUrl.indexOf('?text='));
                const rawText = textParamMatch[2];
                btnUrl = base + '?text=' + encodeURIComponent(decodeURIComponent(rawText));
            }
            whatsappButton = (
                <a 
                    href={btnUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        marginTop: '12px',
                        backgroundColor: '#25D366',
                        color: 'white',
                        padding: '10px 18px',
                        borderRadius: '25px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)',
                        transition: 'all 0.2s ease-in-out'
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 22a9.97 9.97 0 0 1-5.1-1.39l-.36-.21-3.791.993 1.006-3.696-.23-.367A9.969 9.969 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.546 5.864L0 24l6.302-1.653A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                    </svg>
                    {btnText}
                </a>
            );
        }

        // 2. Check for PayPhone Links [wa-button]Text:(https://pay.payphonetodoesposible.com...)
        const payphoneRegex = /\[wa-button\](.*?):\((https:\/\/pay\.payphonetodoesposible\.com[^\)]+)\)/;
        const payphoneMatch = processedContent.match(payphoneRegex);
        
        let payphoneButton = null;

        if (payphoneMatch) {
            processedContent = processedContent.replace(payphoneRegex, '').trim();
            const btnText = payphoneMatch[1];
            const btnUrl = payphoneMatch[2];
            
            payphoneButton = (
                <button 
                    onClick={() => openPayPhoneCheckout(btnUrl)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        marginTop: '12px',
                        backgroundColor: '#efa238',
                        color: 'white',
                        padding: '10px 18px',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '25px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        boxShadow: '0 4px 10px rgba(239, 162, 56, 0.3)',
                        transition: 'all 0.2s ease-in-out'
                    }}
                >
                    💳 {btnText}
                </button>
            );
        }

                   // Bold markdown parsing
        const parts = processedContent.split(/(\*\*.*?\*\*)/g);
        
        return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div>
                    {parts.map((part, index) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={index}>{part.slice(2, -2)}</strong>;
                        }
                        return <span key={index}>{part}</span>;
                    })}
                </div>
                {whatsappButton}
                {payphoneButton}
            </div>
        );
    };

    if (isHiddenPath) return null;

    return (
        <>
        {/* Dark Overlay that appears after 8 seconds */}
        {showHighlight && (
            <div 
                onClick={dismissHighlight}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(3px)',
                    zIndex: 9998,
                    animation: 'fadeInOverlay 0.5s ease-out'
                }}
            />
        )}
        
        <div style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            fontFamily: '"Inter", sans-serif' 
        }}>
            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    marginBottom: '20px',
                    width: '350px',
                    height: '450px',
                    backgroundColor: '#fff',
                    borderRadius: '0',
                    boxShadow: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    animation: 'slideUp 0.3s ease-out',
                    border: '1px solid rgba(15, 23, 42, 0.08)'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#fff',
                        color: '#111827',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(15, 23, 42, 0.08)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <VimeoFacade
                                src="https://player.vimeo.com/video/1174861620?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&loop=1&background=1"
                                title="Asistente IA"
                                style={{
                                    width: '35px',
                                    height: '35px',
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: '0',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    flexShrink: 0,
                                }}
                                iframeStyle={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '250%', height: '250%', pointerEvents: 'none' }}
                            />
                            <div>
                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Karen Asistente IA</h4>
                                {chatMode !== 'ia' && remainingAIRequests !== null && (
                                    <span style={{
                                        display: 'inline-block',
                                        marginTop: '4px',
                                        padding: '2px 7px',
                                        borderRadius: '0',
                                        backgroundColor: remainingAIRequests > 0 ? '#f3f4f6' : '#fee2e2',
                                        fontSize: '10px',
                                        fontWeight: 600
                                    }}>
                                        {remainingAIRequests > 0
                                            ? `${remainingAIRequests} consultas IA ${chatAccessTier === 'client' ? 'de cliente' : chatAccessTier === 'qualified_lead' ? 'de lead' : chatAccessTier === 'registered_user' ? 'registradas' : 'gratis'} hoy`
                                            : 'Limite gratuito alcanzado'}
                                    </span>
                                )}
                                <span style={{ fontSize: '11px', opacity: 0.8, display: 'block' }}>{chatUser?.name ? `Sesion: ${chatUser.name}` : 'En linea'}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                                onClick={() => {
                                    const newEnabled = !isAudioEnabled;
                                    setIsAudioEnabled(newEnabled);
                                    if (!newEnabled && currentTTSAudioRef.current && !currentTTSAudioRef.current.paused) {
                                        currentTTSAudioRef.current.pause();
                                        currentTTSAudioRef.current.currentTime = 0;
                                    }
                                }}
                                style={{
                                    background: 'transparent', border: 'none', color: '#111827', cursor: 'pointer', padding: '5px'
                                }}
                                title={isAudioEnabled ? "Silenciar Voz IA" : "Activar Voz IA"}
                            >
                                {isAudioEnabled ? <RiVolumeUpFill size={22} /> : <RiVolumeMuteFill size={22} color="#ffb3b3" />}
                            </button>
                            <button 
                                onClick={toggleChat}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#111827',
                                    cursor: 'pointer',
                                    padding: '5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <RiCloseLine size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div style={{
                        flex: 1,
                        padding: '20px',
                        backgroundColor: '#f8f9fa',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px'
                    }}>
                        {!chatModeSelected ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '15px', padding: '10px', textAlign: 'center' }}>
                                <h3 style={{ margin: 0, color: '#333', fontSize: '18px', fontWeight: 'bold' }}>¡Hola!</h3>
                                <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px', lineHeight: '1.4' }}>Elige cómo quieres conversar. El Asistente IA es tu asesor personal (requiere registro); el ChatBot da respuestas rápidas al instante.</p>
                                
                                <button 
                                    onClick={() => selectChatMode('ia')}
                                    style={{ width: '100%', padding: '14px 15px', borderRadius: '12px', border: 'none', backgroundColor: '#4A00E1', color: 'white', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(74,0,225,0.2)' }}
                                >
                                    <RiRobot2Line size={20} /> Asistente IA (asesor personal)
                                </button>
                                
                                <button 
                                    onClick={() => selectChatMode('bot')}
                                    style={{ width: '100%', padding: '14px 15px', borderRadius: '12px', border: '1px solid #ddd', backgroundColor: 'white', color: '#555', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <RiChat3Line size={20} /> ChatBot automatico (respuestas rapidas)
                                </button>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, index) => {
                                    // For assistant messages, only show revealed portion
                                    const isAssistant = msg.role === 'assistant';
                                    const revealed = revealedChars[index] || 0;
                                    const isTyping = isAssistant && revealed < (msg.content?.length || 0);
                                    const displayContent = isAssistant
                                        ? (msg.content || '').slice(0, revealed)
                                        : msg.content;

                                    return (
                                    <div key={index} style={{
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        backgroundColor: '#fff',
                                        color: '#111827',
                                        padding: '12px 16px',
                                        borderRadius: '0',
                                        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
                                        border: msg.role === 'user' ? '1px solid rgba(15, 23, 42, 0.12)' : '1px solid rgba(15, 23, 42, 0.08)',
                                        maxWidth: '85%',
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        wordWrap: 'break-word',
                                        animation: 'msgFadeIn 0.4s ease-out',
                                        position: 'relative'
                                    }}>
                                        {isAssistant
                                            ? (
                                                <>
                                                    {renderMessageContent(displayContent, isTyping || !!msg.streaming)}
                                                    {isTyping && (
                                                        <span className="ai-cursor" style={{
                                                            display: 'inline-block',
                                                            width: '2px',
                                                            height: '14px',
                                                            backgroundColor: '#4A00E1',
                                                            marginLeft: '2px',
                                                            verticalAlign: 'text-bottom',
                                                            animation: 'cursorBlink 0.8s step-end infinite'
                                                        }} />
                                                    )}
                                                </>
                                            )
                                            : renderMessageContent(msg.content)}
                                    </div>
                                    );
                                })}
                        
                        {/* Cajas de sugerencias o "Quick Replies" */}                                {chatMode === 'bot' && showSuggestions && messages.length <= 1 && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                alignItems: 'flex-start',
                                marginTop: '5px'
                            }}>
                                {suggestions.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        style={{
                                            backgroundColor: 'rgba(74, 0, 225, 0.08)',
                                            color: '#4A00E1',
                                            border: '1px solid rgba(74, 0, 225, 0.2)',
                                            padding: '8px 14px',
                                            borderRadius: '20px',
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            textAlign: 'left',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(74, 0, 225, 0.15)';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(74, 0, 225, 0.08)';
                                            e.currentTarget.style.transform = 'none';
                                        }}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}

                        {showChatAuth && (
                            <div style={{
                                alignSelf: 'stretch',
                                backgroundColor: '#ffffff',
                                color: '#111827',
                                borderRadius: '0',
                                padding: '16px',
                                boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
                                border: '1px solid rgba(15, 23, 42, 0.08)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '9px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
                                    <strong style={{ fontSize: '14px' }}>{chatAuthMode === 'verify' ? 'Verifica tu correo' : chatAuthMode === 'register' ? 'Crea tu Asistente IA' : (chatAuthMode === 'forgot' || chatAuthMode === 'reset') ? 'Recupera tu acceso' : 'Inicia sesion en tu IA'}</strong>
                                    <button
                                        onClick={() => setChatAuthMode(prev => {
                                            if (prev === 'register') return 'login';
                                            if (prev === 'login') return 'register';
                                            return 'login'; // desde forgot/reset volver a login
                                        })}
                                        disabled={isSubmittingChatAuth}
                                        style={{
                                            border: '1px solid rgba(15, 23, 42, 0.12)',
                                            background: '#f8fafc',
                                            color: '#111827',
                                            borderRadius: '0',
                                            padding: '5px 9px',
                                            fontSize: '11px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {chatAuthMode === 'register' ? 'Ya tengo cuenta' : chatAuthMode === 'login' ? 'Crear cuenta' : 'Volver a iniciar sesion'}
                                    </button>
                                </div>
                                <span style={{ color: '#475467', fontSize: '12px', lineHeight: 1.4 }}>
                                    {chatAuthMode === 'verify'
                                        ? 'Ingresa el codigo de 6 digitos que enviamos a tu correo para activar tu Asistente IA.'
                                        : chatAuthMode === 'register'
                                        ? 'Registrate con tu correo para usar el Asistente IA sin limites como tu asesor personal.'
                                        : chatAuthMode === 'forgot'
                                        ? 'Escribe tu email y te enviamos un codigo de 6 digitos para restablecer tu clave.'
                                        : chatAuthMode === 'reset'
                                        ? 'Ingresa el codigo que te enviamos y tu nueva clave.'
                                        : 'Inicia sesion para recuperar tu cupo de usuario registrado.'}
                                </span>
                                {chatAuthMode === 'register' && (
                                    <input
                                        type="text"
                                        placeholder="Nombre"
                                        value={chatAuthForm.name}
                                        onChange={(e) => setChatAuthForm(prev => ({ ...prev, name: e.target.value }))}
                                        disabled={isSubmittingChatAuth}
                                        style={{ border: '1px solid rgba(15, 23, 42, 0.12)', backgroundColor: '#fff', color: '#111827', borderRadius: '0', padding: '9px 11px', fontSize: '12px', outline: 'none' }}
                                    />
                                )}
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={chatAuthMode === 'verify' ? (pendingVerifyEmail || chatAuthForm.email) : chatAuthForm.email}
                                    onChange={(e) => setChatAuthForm(prev => ({ ...prev, email: e.target.value }))}
                                    disabled={isSubmittingChatAuth || chatAuthMode === 'verify'}
                                    style={{ border: '1px solid rgba(15, 23, 42, 0.12)', backgroundColor: '#fff', color: '#111827', borderRadius: '0', padding: '9px 11px', fontSize: '12px', outline: 'none' }}
                                />
                                {chatAuthMode === 'register' && (
                                    <input
                                        type="text"
                                        placeholder="WhatsApp opcional"
                                        value={chatAuthForm.phone}
                                        onChange={(e) => setChatAuthForm(prev => ({ ...prev, phone: e.target.value }))}
                                        disabled={isSubmittingChatAuth}
                                        style={{ border: '1px solid rgba(15, 23, 42, 0.12)', backgroundColor: '#fff', color: '#111827', borderRadius: '0', padding: '9px 11px', fontSize: '12px', outline: 'none' }}
                                    />
                                )}
                                {(chatAuthMode === 'reset' || chatAuthMode === 'verify') && (
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="Codigo de 6 digitos"
                                        value={chatAuthForm.code}
                                        onChange={(e) => setChatAuthForm(prev => ({ ...prev, code: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                                        disabled={isSubmittingChatAuth}
                                        style={{ border: '1px solid rgba(15, 23, 42, 0.12)', backgroundColor: '#fff', color: '#111827', borderRadius: '0', padding: '9px 11px', fontSize: '12px', outline: 'none', letterSpacing: '4px' }}
                                    />
                                )}
                                {chatAuthMode !== 'forgot' && chatAuthMode !== 'verify' && (
                                    <input
                                        type="password"
                                        placeholder={chatAuthMode === 'reset' ? 'Nueva clave' : 'Clave'}
                                        value={chatAuthForm.password}
                                        onChange={(e) => setChatAuthForm(prev => ({ ...prev, password: e.target.value }))}
                                        disabled={isSubmittingChatAuth}
                                        style={{ border: '1px solid rgba(15, 23, 42, 0.12)', backgroundColor: '#fff', color: '#111827', borderRadius: '0', padding: '9px 11px', fontSize: '12px', outline: 'none' }}
                                    />
                                )}
                                {chatAuthMode === 'login' && (
                                    <button
                                        onClick={() => setChatAuthMode('forgot')}
                                        disabled={isSubmittingChatAuth}
                                        style={{
                                            alignSelf: 'flex-start',
                                            background: 'none',
                                            border: 'none',
                                            color: '#b45309',
                                            fontSize: '11px',
                                            cursor: 'pointer',
                                            padding: 0,
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        Olvide mi clave
                                    </button>
                                )}
                                <button
                                    onClick={chatAuthMode === 'forgot' ? submitChatForgot : chatAuthMode === 'reset' ? submitChatReset : submitChatAuth}
                                    disabled={isSubmittingChatAuth}
                                    style={{
                                        border: 'none',
                                        borderRadius: '0',
                                        padding: '10px 14px',
                                        backgroundColor: isSubmittingChatAuth ? '#94a3b8' : '#ffffff',
                                        color: '#111827',
                                        fontWeight: 'bold',
                                        cursor: isSubmittingChatAuth ? 'not-allowed' : 'pointer',
                                        fontSize: '13px',
                                        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
                                        border: '1px solid rgba(15, 23, 42, 0.12)'
                                    }}
                                >
                                    {isSubmittingChatAuth ? 'Procesando...' : chatAuthMode === 'verify' ? 'Activar mi Asistente IA' : chatAuthMode === 'register' ? 'Registrarme' : chatAuthMode === 'forgot' ? 'Enviar codigo' : chatAuthMode === 'reset' ? 'Guardar nueva clave' : 'Iniciar sesion'}
                                </button>
                            </div>
                        )}

                        {showLeadCapture && (
                            <div style={{
                                alignSelf: 'stretch',
                                backgroundColor: '#fff',
                                border: '1px solid rgba(74, 0, 225, 0.16)',
                                borderRadius: '16px',
                                padding: '14px',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '9px'
                            }}>
                                <strong style={{ color: '#4A00E1', fontSize: '14px' }}>Continuemos tu cotizacion</strong>
                                <span style={{ color: '#666', fontSize: '12px', lineHeight: 1.4 }}>
                                    Deja tu nombre, WhatsApp y tipo de proyecto. Ventas puede continuar por WhatsApp sin hacerte repetir el contexto.
                                </span>
                                {[
                                    ['name', 'Nombre'],
                                    ['phone', 'WhatsApp'],
                                    ['email', 'Email opcional'],
                                    ['projectType', 'Tipo de proyecto']
                                ].map(([field, placeholder]) => (
                                    <input
                                        key={field}
                                        type={field === 'email' ? 'email' : 'text'}
                                        placeholder={placeholder}
                                        value={leadForm[field]}
                                        onChange={(e) => setLeadForm(prev => ({ ...prev, [field]: e.target.value }))}
                                        disabled={isSubmittingLead}
                                        style={{
                                            border: '1px solid #eee',
                                            borderRadius: '10px',
                                            padding: '9px 11px',
                                            fontSize: '12px',
                                            outline: 'none'
                                        }}
                                    />
                                ))}
                                <button
                                    onClick={submitLeadCapture}
                                    disabled={isSubmittingLead}
                                    style={{
                                        border: 'none',
                                        borderRadius: '999px',
                                        padding: '10px 14px',
                                        backgroundColor: isSubmittingLead ? '#bbb' : '#25D366',
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        cursor: isSubmittingLead ? 'not-allowed' : 'pointer',
                                        fontSize: '13px'
                                    }}
                                >
                                    {isSubmittingLead ? 'Enviando...' : 'Enviar datos'}
                                </button>
                            </div>
                        )}

                            </>
                        )}

                        {isLoading && !messages.some(m => m.streaming) && (
                            <div style={{
                                alignSelf: 'flex-start',
                                backgroundColor: '#fff',
                                padding: '14px 20px',
                                borderRadius: '15px',
                                borderTopLeftRadius: '2px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                animation: 'msgFadeIn 0.4s ease-out',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                {/* Modern thinking dots */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {[0, 1, 2].map(i => (
                                        <span key={i} style={{
                                            width: '7px',
                                            height: '7px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #4A00E1, #8E2DE2)',
                                            display: 'inline-block',
                                            animation: `thinkingDot 1.4s ease-in-out ${i * 0.2}s infinite`
                                        }} />
                                    ))}
                                </div>
                                <span style={{
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: '#999',
                                    fontStyle: 'italic'
                                }}>Karen está escribiendo</span>
                            </div>
                        )}
                    </div>

                    {/* Footer / Input Area */}
                    {chatModeSelected && (
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#fff',
                        borderTop: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <input 
                            type="text" 
                            placeholder="Escribe tu mensaje..." 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            disabled={isLoading}
                             style={{
                                flex: 1,
                                border: '1px solid #eee',
                                borderRadius: '30px',
                                padding: '10px 15px',
                                fontSize: '13px',
                                backgroundColor: '#f9f9f9',
                                outline: 'none'
                             }}
                        />
                         <button 
                            onClick={toggleListening}
                            disabled={isLoading}
                            title={isListening ? "Detener micrófono" : "Hablar por micrófono"}
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                backgroundColor: isListening ? '#FF4757' : '#f0f0f0',
                                color: isListening ? '#fff' : '#666',
                                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: isListening ? '0 0 10px rgba(255, 71, 87, 0.5)' : 'none',
                                flexShrink: 0
                             }}>
                            {isListening ? <RiMicOffFill size={20} /> : <RiMicFill size={20} />}
                         </button>
                         <button 
                            onClick={() => handleSendMessage()}
                            disabled={isLoading || !inputValue.trim() || !chatModeSelected || (chatMode === 'ia' && !(chatUser && chatUser.emailVerified))}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: !isLoading && inputValue.trim() ? '#4A00E1' : '#ddd',
                                color: '#fff',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: !isLoading && inputValue.trim() ? 'pointer' : 'not-allowed',
                                transition: 'background-color 0.2s'
                             }}>
                            <RiSendPlaneFill size={18} style={{ marginLeft: '2px' }} />
                         </button>
                    </div>
                    )}
                </div>
            )}

            {/* Floating Button */}
            {!isOpen && (
                 <div style={{ position: 'relative' }}>
                    {/* Tooltip */}
                    <div style={{
                        position: 'absolute',
                        right: '75px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: '#333',
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        opacity: isHovered ? 1 : 0,
                        visibility: isHovered ? 'visible' : 'hidden',
                        transition: 'opacity 0.2s, visibility 0.2s',
                        pointerEvents: 'none',
                        marginRight: '10px'
                    }}>
                        Habla con nuestra asistente Karen
                        {/* Triangle arrow */}
                        <div style={{
                            position: 'absolute',
                            right: '-6px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 0,
                            height: 0,
                            borderTop: '6px solid transparent',
                            borderBottom: '6px solid transparent',
                            borderLeft: '6px solid #333'
                        }}></div>
                    </div>

                    <button 
                        onClick={toggleChat}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{
                            width: '85px',
                            height: '85px',
                            borderRadius: '50%',
                            background: 'transparent',
                            color: '#fff',
                            border: showHighlight ? '3px solid #fff' : 'none',
                            boxShadow: showHighlight 
                                ? '0 0 0 10px rgba(255, 255, 255, 0.2), 0 0 30px rgba(0, 0, 0, 0.3)' 
                                : '0 4px 15px rgba(0, 0, 0, 0.2)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            animation: showHighlight ? 'pulseHighlight 1.5s infinite' : 'none',
                            zIndex: 9999
                        }}
                         onMouseOver={(e) => {
                            if (!showHighlight) {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!showHighlight) {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                            }
                        }}
                        aria-label="Abrir asistente"
                    >
                        <VimeoFacade
                            src="https://player.vimeo.com/video/1174861620?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&loop=1&background=1"
                            title="Asistente IA"
                            strategy="idle"
                            style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: '50%', pointerEvents: 'none' }}
                            iframeStyle={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '250%', height: '250%', pointerEvents: 'none' }}
                        />
                    </button>
                    {/* Notification Dot */}
                    <span style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        width: '15px',
                        height: '15px',
                        backgroundColor: '#FF4757',
                        borderRadius: '50%',
                        border: '2px solid #fff'
                    }}></span>
                </div>
            )}
            
            <style jsx global>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInOverlay {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes pulseHighlight {
                    0% {
                        transform: scale(1);
                        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7), 0 0 20px rgba(0, 0, 0, 0.2);
                    }
                    50% {
                        transform: scale(1.15);
                        box-shadow: 0 0 0 15px rgba(255, 255, 255, 0.2), 0 0 40px rgba(0, 0, 0, 0.4);
                    }
                    100% {
                        transform: scale(1);
                        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0), 0 0 20px rgba(0, 0, 0, 0.2);
                    }
                }
                @keyframes msgFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(8px) scale(0.97);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                @keyframes cursorBlink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                @keyframes thinkingDot {
                    0%, 80%, 100% {
                        transform: scale(0.6);
                        opacity: 0.4;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
        </>
    );
};

export default AIAssistant;
