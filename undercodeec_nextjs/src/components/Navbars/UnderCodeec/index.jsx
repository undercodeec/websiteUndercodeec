import React from 'react';
import {
    FaGlobe,
    FaInstagram,
    FaFacebookF,
    FaWhatsapp,
} from 'react-icons/fa';
import ReactGA from 'react-ga4';

const UnderCodeec = () => {
    return (
        <div className="undercodeec-container">
            <img src="/assets/img/about/about_s6_bubbles.png" alt="" className="burbuja-rotar" />
            <img src="/assets/img/about/about_s6_bubbles.png" alt="" className="burbuja-rotar2" />
            <img src="/assets/img/header/hand_megaphone.png" alt="" className="animacion-oferta" />
            <div className="undercodeec-card">
                {/* Header Visual */}
                <div className="undercodeec-header">
                    <div className="lava-bubbles2">
                        {[...Array(10)].map((_, i) => (
                            <span key={i} className="bubble2" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s` }} />
                        ))}
                    </div>

                    <h1>Transforma tu Presencia Digital</h1>
                    <p className="undercodeec-subtitle">
                        Solo elige y lo personalizamos
                    </p>
                    <p className="undercodeec-paragraph">
                        Diseñamos y desarrollamos sitios web únicos que capturan la esencia
                        de tu marca.
                    </p>
                </div>

                {/* Información y enlaces */}
                <div className="undercodeec-info">
                    <h2>Conoce más sobre nosotros 🌐 ✨</h2>
                    <p>
                        ¡Síguenos en redes sociales para descubrir nuestro trabajo de
                        calidad! 🎨✨
                        <br />
                        Juntos, podemos llevar la experiencia de tus clientes a otro nivel y
                        hacer crecer tu negocio. 🚀🔥
                    </p>
                </div>

                {/* Links */}
                <div className="undercodeec-links">
                    <a
                        href="https://www.undercodeec.com"
                        className="undercodeec-link"
                        target="_blank"
                        onClick={() => {
                            // Evento para Google Analytics
                            ReactGA.event({
                                category: 'Interacción',
                                action: 'click_navegar_web',
                                label: 'Enlace a la página web'
                            });

                            // Evento para Meta Pixel
                            if (typeof window !== 'undefined' && window.fbq) {
                                window.fbq('trackCustom', 'ClickNavegarWeb', {
                                    location: 'UnderCodeec'
                                });
                            }
                        }}
                    >
                        <FaGlobe /> Nuestra Página Web & Galería de Proyectos
                    </a>

                    <a
                        href="https://wa.me/?text=Hola%20UndercodeEC"
                        className="undercodeec-link whatsapp"
                        target="_blank"
                        onClick={() => {
                            // Evento para Google Analytics
                            ReactGA.event({
                                category: 'Interacción',
                                action: 'click_whatsapp',
                                label: 'Enlace WhatsApp'
                            });

                            // Evento para Meta Pixel
                            if (typeof window !== 'undefined' && window.fbq) {
                                window.fbq('trackCustom', 'ClickWhatsapp', {
                                    location: 'UnderCodeec'
                                });
                            }
                        }}
                    >
                        <FaWhatsapp /> WhatsApp
                    </a>

                    <a
                        href="https://www.instagram.com/undercodeec/"
                        className="undercodeec-link instagram"
                        target="_blank"
                        onClick={() => {
                            // Evento para Google Analytics
                            ReactGA.event({
                                category: 'Interacción',
                                action: 'click_instagram',
                                label: 'Enlace Instagram'
                            });

                            // Evento para Meta Pixel
                            if (typeof window !== 'undefined' && window.fbq) {
                                window.fbq('trackCustom', 'ClickInstagram', {
                                    location: 'UnderCodeec'
                                });
                            }
                        }}
                    >
                        <FaInstagram /> Instagram
                    </a>

                    <a
                        href="https://www.facebook.com/undercodeec"
                        className="undercodeec-link facebook"
                        target="_blank"
                        onClick={() => {
                            // Evento para Google Analytics
                            ReactGA.event({
                                category: 'Interacción',
                                action: 'click_facebook',
                                label: 'Enlace Facebook'
                            });

                            // Evento para Meta Pixel
                            if (typeof window !== 'undefined' && window.fbq) {
                                window.fbq('trackCustom', 'ClickFacebook', {
                                    location: 'UnderCodeec'
                                });
                            }
                        }}
                    >
                        <FaFacebookF /> Facebook
                    </a>

                    <div>
                        <img src="/landing-preview/img/animacion-cuerpo.webp" alt="" className="animacion-cuerpo" />
                        <img src="/landing-preview/img/animacion-cabeza.webp" alt="" className="animacion-cabeza" />
                        <img src="/landing-preview/img/animacion-buzon.webp" alt="" className="animacion-buzon" />
                        <img src="/landing-preview/img/animacion-chat.webp" alt="" className="animacion-chat" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnderCodeec;
