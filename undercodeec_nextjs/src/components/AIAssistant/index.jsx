"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { RiRobot2Line, RiCloseLine, RiSendPlaneFill, RiMicFill, RiMicOffFill, RiVolumeUpFill, RiVolumeMuteFill } from 'react-icons/ri';
import VimeoFacade from '@/components/Vimeo/VimeoFacade';

const AIAssistant = () => {
    const pathname = usePathname();
    const isHiddenPath = pathname?.startsWith('/admin') || pathname?.startsWith('/contratos');
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [chatModeSelected, setChatModeSelected] = useState(false);
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

    const appendAssistantMessage = (content) => {
        setMessages(prev => [...prev, { role: 'assistant', content, streaming: false }]);
    };

    const getChatSessionId = () => {
        if (chatSessionIdRef.current) return chatSessionIdRef.current;
        const key = 'undercodeec_chat_session_id';
        let sessionId = localStorage.getItem(key);
        if (!sessionId) {
            const randomPart = Math.random().toString(36).slice(2);
            sessionId = `chat_${Date.now().toString(36)}_${randomPart}`;
            localStorage.setItem(key, sessionId);
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
        return localStorage.getItem('undercodeec_chat_auth_token') || '';
    };

    const buildChatHeaders = () => {
        const headers = { 'Content-Type': 'application/json' };
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
        const storedUser = localStorage.getItem('undercodeec_chat_user');
        if (storedUser) {
            try {
                setChatUser(JSON.parse(storedUser));
                setChatAccessTier('registered_user');
            } catch {
                localStorage.removeItem('undercodeec_chat_user');
            }
        }
    }, []);

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
            Object.values(typewriterTimers.current).forEach(clearInterval);
        };
    }, [messages, startTypewriter]);

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
        "👉 Quiero cotizar un proyecto nuevo",
        "🔄 Necesito modernizar mi web actual",
        "💼 Me gustaría ver ejemplos de su trabajo",
        "📞 Deseo comunicarme con un asesor humano"
    ];

    const handleSuggestionClick = (text) => {
        handleSendMessage(text);
        setShowSuggestions(false);
    };

    const submitChatAuth = async () => {
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...chatAuthForm,
                    sessionId: getChatSessionId(),
                }),
            });
            updateRemainingAIRequests(response);
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                appendAssistantMessage(data.error || 'No pude activar tu cuenta del asistente.');
                return;
            }
            if (data.token) localStorage.setItem('undercodeec_chat_auth_token', data.token);
            if (data.user) {
                localStorage.setItem('undercodeec_chat_user', JSON.stringify(data.user));
                setChatUser(data.user);
            }
            if (data.accessTier) setChatAccessTier(data.accessTier);
            if (Number.isFinite(Number(data.remainingToday))) setRemainingAIRequests(Number(data.remainingToday));
            setShowChatAuth(false);
            setShowLeadCapture(false);
            appendAssistantMessage(data.message || 'Sesion activada. Ya puedes seguir usando el asistente con mas consultas.');
        } catch (error) {
            console.error('Error authenticating chat user:', error);
            appendAssistantMessage('No pude activar tu cuenta ahora. Puedes dejar tus datos o continuar por WhatsApp.');
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
            if (data.token) localStorage.setItem('undercodeec_chat_auth_token', data.token);
            if (data.user) {
                localStorage.setItem('undercodeec_chat_user', JSON.stringify(data.user));
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
        if (!leadForm.name.trim() || (!leadForm.phone.trim() && !leadForm.email.trim())) {
            appendAssistantMessage('Para continuar necesito tu nombre y al menos tu WhatsApp o email.');
            return;
        }

        setIsSubmittingLead(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';
            const response = await fetch(`${baseUrl}/api/chat/lead`, {
                method: 'POST',
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

    const selectMode = async (useVoice) => {
        setIsAudioEnabled(useVoice);
        setChatModeSelected(true);
        setIsLoading(true);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';
            const backendUrl = `${baseUrl}/api/chat`;

            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: buildChatHeaders(),
                body: JSON.stringify({ message: 'SALUDO_INICIAL', sessionId: getChatSessionId() }),
            });
            updateRemainingAIRequests(response);

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                appendAssistantMessage(data.cta || data.error || 'No pude iniciar el asistente en este momento.');
                if (response.status === 429) {
                    setShowLeadCapture(true);
                    setShowChatAuth(true);
                }
                return;
            }

            const fullText = await consumeChatStream(response);

            if (fullText) {
                if (useVoice) {
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

    const toggleChat = () => {
        dismissHighlight();
        setIsOpen(!isOpen);
    };

    const handleSendMessage = async (customMessage = null) => {
        const textToSend = customMessage || inputValue;
        if (!textToSend.trim()) return;

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
                headers: buildChatHeaders(),
                body: JSON.stringify({
                    sessionId: getChatSessionId(),
                    message: userMessage.content,
                    history: [...messages, userMessage],
                }),
            });
            updateRemainingAIRequests(response);

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                appendAssistantMessage(data.cta || data.error || 'No pude procesar tu mensaje. Intenta nuevamente.');
                if (response.status === 429) {
                    setShowLeadCapture(true);
                    setShowChatAuth(true);
                }
                return;
            }

            const fullText = await consumeChatStream(response);

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
                    onClick={() => {
                        const width = 500;
                        const height = 700;
                        const left = (window.innerWidth - width) / 2;
                        const top = (window.innerHeight - height) / 2;
                        
                        const paymentWindow = window.open(
                            btnUrl,
                            'PayPhoneCheckout',
                            `width=${width},height=${height},left=${left},top=${top},status=yes,scrollbars=yes`
                        );
                        
                        // Listen for payment completion from payment-result.html
                        // SECURITY: Orígenes permitidos para postMessage de pagos
                        const allowedOrigins = [
                            'https://pay.payphonetodoesposible.com',
                            'https://api.undercodeec.com',
                            window.location.origin
                        ];
                        const handlePaymentMessage = (event) => {
                            // SECURITY: Verificar que el mensaje viene de un origen permitido
                            if (!allowedOrigins.includes(event.origin)) {
                                return;
                            }
                            if (event.data && event.data.type === 'PAYMENT_COMPLETED') {
                                if (paymentWindow && !paymentWindow.closed) {
                                    paymentWindow.close();
                                }
                                window.removeEventListener('message', handlePaymentMessage);
                                
                                setMessages(prev => [...prev, { role: 'assistant', content: '✅ ¡He confirmado tu pago exitosamente! En breve recibirás los correos con tu recibo y acceso a Google Drive.' }]);
                            }
                        };
                        
                        window.addEventListener('message', handlePaymentMessage);
                    }}
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
                    borderRadius: '20px',
                    boxShadow: '0 5px 40px rgba(0,0,0,0.16)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    animation: 'slideUp 0.3s ease-out',
                    border: '1px solid rgba(0,0,0,0.05)'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, #4A00E1 0%, #8E2DE2 100%)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <VimeoFacade
                                src="https://player.vimeo.com/video/1174861620?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&loop=1&background=1"
                                title="Asistente IA"
                                style={{
                                    width: '35px',
                                    height: '35px',
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    flexShrink: 0,
                                }}
                                iframeStyle={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '250%', height: '250%', pointerEvents: 'none' }}
                            />
                            <div>
                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Karen Asistente IA</h4>
                                {remainingAIRequests !== null && (
                                    <span style={{
                                        display: 'inline-block',
                                        marginTop: '4px',
                                        padding: '2px 7px',
                                        borderRadius: '999px',
                                        backgroundColor: remainingAIRequests > 0 ? 'rgba(255,255,255,0.18)' : 'rgba(255, 71, 87, 0.28)',
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
                                    background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '5px'
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
                                    color: '#fff',
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
                                <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px', lineHeight: '1.4' }}>Para brindarte una mejor experiencia, elige tu modo de interacción:</p>
                                
                                <button 
                                    onClick={() => selectMode(true)}
                                    style={{ width: '100%', padding: '14px 15px', borderRadius: '12px', border: 'none', backgroundColor: '#4A00E1', color: 'white', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(74,0,225,0.2)' }}
                                >
                                    <RiVolumeUpFill size={20} /> Conversar por Voz
                                </button>
                                
                                <button 
                                    onClick={() => selectMode(false)}
                                    style={{ width: '100%', padding: '14px 15px', borderRadius: '12px', border: '1px solid #ddd', backgroundColor: 'white', color: '#555', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <RiRobot2Line size={20} /> Conversar por Chat
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
                                        backgroundColor: msg.role === 'user' ? '#4A00E1' : '#fff',
                                        color: msg.role === 'user' ? '#fff' : '#333',
                                        padding: '12px 16px',
                                        borderRadius: '15px',
                                        borderTopLeftRadius: msg.role === 'user' ? '15px' : '2px',
                                        borderTopRightRadius: msg.role === 'user' ? '2px' : '15px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
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
                        
                        {/* Cajas de sugerencias o "Quick Replies" */}                                {showSuggestions && messages.length <= 1 && (
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
                                backgroundColor: '#101828',
                                color: '#fff',
                                borderRadius: '16px',
                                padding: '14px',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '9px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
                                    <strong style={{ fontSize: '14px' }}>Amplia tu cupo IA gratis</strong>
                                    <button
                                        onClick={() => setChatAuthMode(prev => {
                                            if (prev === 'register') return 'login';
                                            if (prev === 'login') return 'register';
                                            return 'login'; // desde forgot/reset volver a login
                                        })}
                                        disabled={isSubmittingChatAuth}
                                        style={{
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            background: 'rgba(255,255,255,0.08)',
                                            color: '#fff',
                                            borderRadius: '999px',
                                            padding: '5px 9px',
                                            fontSize: '11px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {chatAuthMode === 'register' ? 'Ya tengo cuenta' : chatAuthMode === 'login' ? 'Crear cuenta' : 'Volver a iniciar sesion'}
                                    </button>
                                </div>
                                <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: '12px', lineHeight: 1.4 }}>
                                    {chatAuthMode === 'register'
                                        ? 'Registrate y subimos tu limite a 25 consultas IA hoy.'
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
                                        style={{ border: '1px solid rgba(255,255,255,0.16)', borderRadius: '10px', padding: '9px 11px', fontSize: '12px', outline: 'none' }}
                                    />
                                )}
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={chatAuthForm.email}
                                    onChange={(e) => setChatAuthForm(prev => ({ ...prev, email: e.target.value }))}
                                    disabled={isSubmittingChatAuth}
                                    style={{ border: '1px solid rgba(255,255,255,0.16)', borderRadius: '10px', padding: '9px 11px', fontSize: '12px', outline: 'none' }}
                                />
                                {chatAuthMode === 'register' && (
                                    <input
                                        type="text"
                                        placeholder="WhatsApp opcional"
                                        value={chatAuthForm.phone}
                                        onChange={(e) => setChatAuthForm(prev => ({ ...prev, phone: e.target.value }))}
                                        disabled={isSubmittingChatAuth}
                                        style={{ border: '1px solid rgba(255,255,255,0.16)', borderRadius: '10px', padding: '9px 11px', fontSize: '12px', outline: 'none' }}
                                    />
                                )}
                                {chatAuthMode === 'reset' && (
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="Codigo de 6 digitos"
                                        value={chatAuthForm.code}
                                        onChange={(e) => setChatAuthForm(prev => ({ ...prev, code: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                                        disabled={isSubmittingChatAuth}
                                        style={{ border: '1px solid rgba(255,255,255,0.16)', borderRadius: '10px', padding: '9px 11px', fontSize: '12px', outline: 'none', letterSpacing: '4px' }}
                                    />
                                )}
                                {chatAuthMode !== 'forgot' && (
                                    <input
                                        type="password"
                                        placeholder={chatAuthMode === 'reset' ? 'Nueva clave' : 'Clave'}
                                        value={chatAuthForm.password}
                                        onChange={(e) => setChatAuthForm(prev => ({ ...prev, password: e.target.value }))}
                                        disabled={isSubmittingChatAuth}
                                        style={{ border: '1px solid rgba(255,255,255,0.16)', borderRadius: '10px', padding: '9px 11px', fontSize: '12px', outline: 'none' }}
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
                                            color: '#efa238',
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
                                        borderRadius: '999px',
                                        padding: '10px 14px',
                                        backgroundColor: isSubmittingChatAuth ? '#667085' : '#efa238',
                                        color: '#101828',
                                        fontWeight: 'bold',
                                        cursor: isSubmittingChatAuth ? 'not-allowed' : 'pointer',
                                        fontSize: '13px'
                                    }}
                                >
                                    {isSubmittingChatAuth ? 'Procesando...' : chatAuthMode === 'register' ? 'Registrarme gratis' : chatAuthMode === 'forgot' ? 'Enviar codigo' : chatAuthMode === 'reset' ? 'Guardar nueva clave' : 'Iniciar sesion'}
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
                                    Deja tus datos y un asesor puede continuar sin gastar mas consultas IA.
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
                            disabled={isLoading || !inputValue.trim() || !chatModeSelected}
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
