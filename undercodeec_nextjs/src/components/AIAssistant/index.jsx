"use client";

import { useState, useEffect } from 'react';
import { RiRobot2Line, RiCloseLine, RiSendPlaneFill } from 'react-icons/ri';

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hola, soy el asistente virtual de Undercodeec, si necesitas ayuda o necesitas un proyecto, no dudes en preguntarme. ' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
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
    
    // Highlight effect states
    const [showHighlight, setShowHighlight] = useState(false);
    const [hasBeenHighlighted, setHasBeenHighlighted] = useState(false);

    // Timer for the 8 seconds highlight effect
    useEffect(() => {
        // Obtenemos si ya se resaltó antes en esta sesión para no molestarlo en cada página
        const alreadyHighlighted = sessionStorage.getItem('chatbot_highlighted');
        
        if (!alreadyHighlighted) {
            const timer = setTimeout(() => {
                if (!isOpen) { // Only highlight if they haven't opened it already
                    setShowHighlight(true);
                }
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const dismissHighlight = () => {
        if (showHighlight) {
            setShowHighlight(false);
            setHasBeenHighlighted(true);
            sessionStorage.setItem('chatbot_highlighted', 'true');
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
        setShowSuggestions(false); // Ocultar sugerencias tras el primer envío

        try {
            // Determinar la URL del backend dinámicamente o usar localhost por defecto para dev
            const backendUrl = process.env.NEXT_PUBLIC_API_URL 
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/chat`
                : (window.location.hostname === 'localhost' ? 'http://localhost:3001/api/chat' : 'https://api.undercodeec.com/api/chat');
            
            // Si estamos en Vercel/Next.js y el backend está en otro puerto, necesitamos la URL completa.
            // Asumo que el backend corre en el puerto 3001 según el .env que vi.

            const response = await fetch(backendUrl, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage.content }),
            });

            const data = await response.json();

            if (data.output_text) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.output_text }]);
                playNotificationSound();
            } else {
                 setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error al procesar tu mensaje.' }]);
            }

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, no puedo conectar con el servidor en este momento.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    // Custom text parser for WhatsApp Buttons, Bold text, and PayPhone Links
    const renderMessageContent = (content) => {
        if (typeof content !== 'string') return content;
        
        // 1. Check for [wa-button]Text:(url)
        const waRegex = /\[wa-button\](.*?):\((https:\/\/wa\.me\/[^\)]+)\)/;
        const waMatch = content.match(waRegex);
        
        let processedContent = content;
        let whatsappButton = null;
        
        if (waMatch) {
            processedContent = processedContent.replace(waRegex, '').trim();
            const btnText = waMatch[1];
            const btnUrl = waMatch[2];
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
                        const handlePaymentMessage = (event) => {
                            if (event.data && event.data.type === 'PAYMENT_COMPLETED') {
                                console.log("✅ Chatbot detected payment completion from popup");
                                if (paymentWindow && !paymentWindow.closed) {
                                    paymentWindow.close();
                                }
                                window.removeEventListener('message', handlePaymentMessage);
                                
                                // Opcional: Puedes agregar un mensaje del asistente confirmando el pago.
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
                            <div style={{
                                width: '35px',
                                height: '35px',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                <img src="/assets/slider/66f0344ac49f2d8983e5df4c83caa818ebfb5c45.png" alt="Asistente IA" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Asistente IA</h4>
                                <span style={{ fontSize: '11px', opacity: 0.8, display: 'block' }}>En línea</span>
                            </div>
                        </div>
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
                        {messages.map((msg, index) => (
                            <div key={index} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                backgroundColor: msg.role === 'user' ? '#4A00E1' : '#fff',
                                color: msg.role === 'user' ? '#fff' : '#333',
                                padding: '12px 16px',
                                borderRadius: '15px',
                                borderTopLeftRadius: msg.role === 'user' ? '15px' : '2px',
                                borderTopRightRadius: msg.role === 'user' ? '2px' : '15px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                maxWidth: '85%',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                wordWrap: 'break-word'
                            }}>
                                {renderMessageContent(msg.content)}
                            </div>
                        ))}
                        
                        {/* Cajas de sugerencias o "Quick Replies" */}
                        {showSuggestions && messages.length === 1 && (
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

                        {isLoading && (
                            <div style={{
                                alignSelf: 'flex-start',
                                backgroundColor: '#fff',
                                padding: '10px',
                                borderRadius: '10px',
                                fontSize: '12px',
                                color: '#999'
                            }}>
                                Escribiendo...
                            </div>
                        )}
                    </div>

                    {/* Footer / Input Area */}
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
                            onClick={() => handleSendMessage()}
                            disabled={isLoading || !inputValue.trim()}
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
                        Habla con nuestro asistente
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
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4A00E1 0%, #8E2DE2 100%)',
                            color: '#fff',
                            border: showHighlight ? '3px solid #fff' : 'none',
                            boxShadow: showHighlight 
                                ? '0 0 0 10px rgba(74, 0, 225, 0.4), 0 0 30px rgba(74, 0, 225, 0.8)' 
                                : '0 4px 15px rgba(74, 0, 225, 0.4)',
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
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(74, 0, 225, 0.5)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!showHighlight) {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(74, 0, 225, 0.4)';
                            }
                        }}
                        aria-label="Abrir asistente"
                    >
                        <img src="/assets/slider/66f0344ac49f2d8983e5df4c83caa818ebfb5c45.png" alt="Asistente" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
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
                        box-shadow: 0 0 0 0 rgba(74, 0, 225, 0.7), 0 0 20px rgba(255, 255, 255, 0.5);
                    }
                    50% {
                        transform: scale(1.15);
                        box-shadow: 0 0 0 15px rgba(74, 0, 225, 0.2), 0 0 40px rgba(255, 255, 255, 0.8);
                    }
                    100% {
                        transform: scale(1);
                        box-shadow: 0 0 0 0 rgba(74, 0, 225, 0), 0 0 20px rgba(255, 255, 255, 0.5);
                    }
                }
            `}</style>
        </div>
        </>
    );
};

export default AIAssistant;
