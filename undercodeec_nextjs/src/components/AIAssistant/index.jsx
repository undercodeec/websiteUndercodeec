"use client";

import { useState } from 'react';
import { RiRobot2Line, RiCloseLine, RiSendPlaneFill } from 'react-icons/ri';

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hola, soy el asistente virtual de Undercodeec. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
             // Determinar la URL del backend dinámicamente o usar localhost por defecto para dev
            const backendUrl = window.location.hostname === 'localhost' 
                ? 'http://localhost:3001/api/chat' 
                : 'https://undercodeec.com/api/chat'; // Ajustar según producción
            
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

    return (
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
                                justifyContent: 'center'
                            }}>
                                <RiRobot2Line size={20} />
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
                                {msg.content}
                            </div>
                        ))}
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
                            onClick={handleSendMessage}
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
                            border: 'none',
                            boxShadow: '0 4px 15px rgba(74, 0, 225, 0.4)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                         onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(74, 0, 225, 0.5)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(74, 0, 225, 0.4)';
                        }}
                        aria-label="Abrir asistente"
                    >
                        <RiRobot2Line />
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
            `}</style>
        </div>
    );
};

export default AIAssistant;
