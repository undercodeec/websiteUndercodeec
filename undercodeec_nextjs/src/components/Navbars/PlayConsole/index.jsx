import React, { useState } from 'react';

const PoliticaContenido = () => {
    // Estado para manejar la sección seleccionada
    const [selectedSection, setSelectedSection] = useState('privacidadApp'); // Inicialmente, "privacidadApp"

    // Datos del JSON (simulados aquí, puedes cargarlos desde un archivo o API)
    const politicaData = {
        "privacidadApp": {
            "titulo": "Política de Privacidad Aplicaciones",
            "secciones": [
                {
                    "titulo": "1. Introducción",
                    "descripcion": "Resumen de la política de privacidad de la aplicación.",
                    "contenido": [
                        "Esta Política de Privacidad describe cómo recopilamos, utilizamos, compartimos y protegemos la información personal de los usuarios cuando interactúan con nuestra aplicación móvil."
                    ]
                },
                {
                    "titulo": "2. Información que recopilamos",
                    "descripcion": "Tipos de información que podemos recopilar.",
                    "contenido": [
                        "Información personal (como nombre, correo electrónico, etc.)",
                        "Datos técnicos como modelo del dispositivo, sistema operativo, tipo de navegador y dirección IP.",
                        "Información de uso de la aplicación (frecuencia de uso, funciones utilizadas, etc.)",
                        "Identificadores del dispositivo y publicidad (como el ID de publicidad de Google).",
                        "Datos de ubicación (si el usuario ha dado su consentimiento)."
                    ]
                },
                {
                    "titulo": "3. Uso de la información",
                    "descripcion": "Finalidades para las que se usa la información recopilada.",
                    "contenido": [
                        "Operar y mantener la funcionalidad de la app.",
                        "Mejorar la experiencia del usuario.",
                        "Realizar análisis estadísticos y estudios de uso.",
                        "Ofrecer contenido personalizado o relevante.",
                        "Cumplir con requisitos legales y normativos."
                    ]
                },
                {
                    "titulo": "4. Compartición de datos",
                    "descripcion": "Casos en los que se podría compartir la información.",
                    "contenido": [
                        "Cuando sea necesario para brindar un servicio solicitado por el usuario.",
                        "Con proveedores que nos ayudan a operar la app (bajo acuerdos de confidencialidad).",
                        "Cuando lo exige la ley o una autoridad competente.",
                        "En caso de fusión o adquisición, con aviso previo al usuario."
                    ]
                },
                {
                    "titulo": "5. Publicidad y analítica",
                    "descripcion": "Uso de servicios de terceros para análisis y publicidad.",
                    "contenido": [
                        "Podemos usar servicios de terceros como Google Analytics o Firebase para recopilar datos agregados y mejorar el rendimiento de la aplicación.",
                        "Si se muestra publicidad, esta podría estar basada en intereses usando identificadores anónimos."
                    ]
                },
                {
                    "titulo": "6. Permisos del dispositivo",
                    "descripcion": "Permisos requeridos por la app.",
                    "contenido": [
                        "La app puede solicitar permisos (como acceso a la cámara, ubicación o almacenamiento) necesarios para brindar funcionalidades específicas.",
                        "Estos permisos se solicitan en tiempo de uso y pueden ser gestionados por el usuario desde los ajustes del dispositivo."
                    ]
                },
                {
                    "titulo": "7. Niños",
                    "descripcion": "Tratamiento de datos de menores de edad.",
                    "contenido": [
                        "No recopilamos conscientemente información personal de menores de edad sin el consentimiento de sus padres o tutores.",
                        "Si descubrimos que hemos recopilado datos de un menor sin autorización, tomaremos medidas para eliminar dicha información."
                    ]
                },
                {
                    "titulo": "8. Seguridad de la información",
                    "descripcion": "Medidas para proteger los datos personales.",
                    "contenido": [
                        "Implementamos medidas técnicas y organizativas adecuadas para proteger los datos personales contra el acceso no autorizado, la divulgación o destrucción."
                    ]
                },
                {
                    "titulo": "9. Retención de datos",
                    "descripcion": "Tiempo durante el cual conservamos los datos.",
                    "contenido": [
                        "Conservamos los datos personales solo durante el tiempo necesario para cumplir con los fines descritos en esta política o lo exigido por la ley."
                    ]
                },
                {
                    "titulo": "10. Derechos del usuario",
                    "descripcion": "Opciones de gestión de datos por parte del usuario.",
                    "contenido": [
                        "Los usuarios pueden acceder, corregir, eliminar o restringir el tratamiento de sus datos personales.",
                        "También pueden retirar su consentimiento en cualquier momento, cuando este haya sido otorgado."
                    ]
                },
                {
                    "titulo": "11. Cambios a esta política",
                    "descripcion": "Posibilidad de actualizar esta política.",
                    "contenido": [
                        "Nos reservamos el derecho de modificar esta política de privacidad.",
                        "Los cambios importantes serán notificados a los usuarios mediante la app o por otros medios adecuados."
                    ]
                },
                {
                    "titulo": "12. Contacto",
                    "descripcion": "Cómo contactarnos en relación a esta política.",
                    "contenido": [
                        "Si tienes preguntas, inquietudes o solicitudes sobre esta política, contáctanos a través de nuestro sitio web o al correo electrónico especificado en la tienda."
                    ]
                },
                {
                    "titulo": "13. Información adicional",
                    "descripcion": "Enlace externo con más información.",
                    "contenido": [
                        "Puedes consultar más información en la política oficial de Google: <a href='https://support.google.com/googleplay/android-developer/answer/9859455?hl=es-419' target='_blank' rel='noopener noreferrer'>Política de Privacidad para Desarrolladores de Google Play</a>."
                    ]
                }

            ]
        },
        "privacidadWeb": {
            "titulo": "Política de Privacidad Sitio Web",
            "secciones": [
                {
                    "titulo": "1. Introducción",
                    "contenido": [
                        "Esta Política de Privacidad describe cómo recopilamos, utilizamos, compartimos y protegemos la información personal de los usuarios cuando visitan y utilizan nuestro sitio web de diseño y desarrollo web."
                    ]
                },
                {
                    "titulo": "2. Información que recopilamos",
                    "descripcion": "Podemos recopilar los siguientes tipos de información:",
                    "contenido": [
                        "Información personal (como nombre, correo electrónico, número de contacto) proporcionada a través de formularios.",
                        "Datos técnicos como dirección IP, navegador utilizado, sistema operativo y páginas visitadas.",
                        "Información de uso del sitio web (interacciones, tiempo en el sitio, formularios completados, etc.).",
                        "Cookies y tecnologías similares para mejorar la experiencia del usuario."
                    ]
                },
                {
                    "titulo": "3. Uso de la información",
                    "descripcion": "Utilizamos la información recopilada para:",
                    "contenido": [
                        "Responder a solicitudes o consultas realizadas a través del sitio web.",
                        "Ofrecer y mejorar nuestros servicios de diseño y desarrollo web.",
                        "Realizar análisis estadísticos sobre el uso del sitio.",
                        "Enviar comunicaciones relacionadas con nuestros servicios (previo consentimiento).",
                        "Cumplir con obligaciones legales aplicables."
                    ]
                },
                {
                    "titulo": "4. Compartición de datos",
                    "descripcion": "No compartimos información personal con terceros, excepto en los siguientes casos:",
                    "contenido": [
                        "Con proveedores de servicios que nos ayudan a operar el sitio web (bajo acuerdos de confidencialidad).",
                        "Cuando sea necesario para cumplir con una obligación legal.",
                        "En caso de fusión, adquisición u otra reestructuración de la empresa, con previo aviso."
                    ]
                },
                {
                    "titulo": "5. Cookies y tecnologías similares",
                    "descripcion": "Utilizamos cookies para personalizar la experiencia del usuario, analizar el tráfico del sitio y mejorar nuestros servicios. El usuario puede gestionar sus preferencias de cookies desde su navegador.",
                    "contenido": []
                },
                {
                    "titulo": "6. Seguridad de la información",
                    "descripcion": "Adoptamos medidas de seguridad técnicas y organizativas para proteger los datos personales contra accesos no autorizados, pérdidas o alteraciones.",
                    "contenido": []
                },
                {
                    "titulo": "7. Retención de datos",
                    "descripcion": "Conservamos los datos personales solo durante el tiempo necesario para los fines para los cuales fueron recopilados, o mientras lo exija la normativa vigente.",
                    "contenido": []
                },
                {
                    "titulo": "8. Derechos del usuario",
                    "descripcion": "Los usuarios pueden ejercer sus derechos de acceso, rectificación, eliminación, limitación y oposición al tratamiento de sus datos, así como retirar su consentimiento en cualquier momento.",
                    "contenido": []
                },
                {
                    "titulo": "9. Cambios a esta política",
                    "descripcion": "Podemos actualizar esta política de privacidad ocasionalmente. Cualquier cambio significativo será comunicado a través del sitio web.",
                    "contenido": []
                },
                {
                    "titulo": "10. Contacto",
                    "descripcion": "Si tienes preguntas o inquietudes sobre esta política, puedes contactarnos a través del formulario de contacto del sitio o al correo electrónico especificado en la sección de contacto.",
                    "contenido": []
                }
            ]
        },
        "terminos": {
            "titulo": "Términos y Condiciones",
            "secciones": [
              {
                "titulo": "1. Aceptación de términos",
                "contenido": [
                  "Al utilizar nuestros servicios, aceptas estos términos en su totalidad. Si no estás de acuerdo, por favor no utilices nuestros productos o sitio web."
                ]
              },
              {
                "titulo": "2. Descripción del servicio",
                "contenido": [
                  "Ofrecemos servicios de diseño y desarrollo web, creación de aplicaciones móviles y desarrollo de software a medida para empresas, emprendedores y profesionales. Cada proyecto es personalizado y se rige por acuerdos específicos previos a su ejecución."
                ]
              },
              {
                "titulo": "3. Responsabilidades del cliente",
                "contenido": [
                  "El cliente se compromete a proporcionar información precisa y completa, colaborar activamente durante el proceso de desarrollo y cumplir con los plazos de pago establecidos."
                ]
              },
              {
                "titulo": "4. Propiedad intelectual",
                "contenido": [
                  "Los desarrollos entregados (web, apps o software) serán propiedad del cliente una vez completado el proyecto y efectuado el pago total, salvo que se indique lo contrario. El cliente es responsable del contenido proporcionado (textos, imágenes, logotipos) y debe contar con los derechos correspondientes."
                ]
              },
              {
                "titulo": "5. Pagos y facturación",
                "contenido": [
                  "Los precios se establecerán según las características del proyecto. Se podrá requerir un anticipo para comenzar el trabajo. El incumplimiento de pagos podrá implicar la suspensión de entregas o servicios relacionados."
                ]
              },
              {
                "titulo": "6. Garantías y soporte",
                "contenido": [
                  "Ofrecemos soporte técnico durante un período limitado posterior a la entrega final. No nos hacemos responsables por problemas causados por modificaciones externas, uso indebido o fallos en plataformas de terceros."
                ]
              },
              {
                "titulo": "7. Limitación de responsabilidad",
                "contenido": [
                  "No garantizamos que los servicios estén libres de errores o interrupciones. Hacemos todo lo posible por garantizar estabilidad, seguridad y cumplimiento, pero no somos responsables por daños indirectos derivados del uso de nuestras soluciones."
                ]
              },
              {
                "titulo": "8. Modificaciones de los términos",
                "contenido": [
                  "Nos reservamos el derecho de modificar estos términos en cualquier momento. Las versiones actualizadas serán publicadas en el sitio web, y su vigencia comenzará desde su publicación."
                ]
              },
              {
                "titulo": "9. Legislación aplicable",
                "contenido": [
                  "Estos términos se rigen por las leyes vigentes en la jurisdicción donde opera nuestra empresa. Cualquier disputa será tratada ante las autoridades competentes."
                ]
              },
              {
                "titulo": "10. Contacto",
                "contenido": [
                  "Si tienes dudas sobre estos términos, puedes contactarnos a través del sitio web o al correo electrónico que figura en nuestra sección de contacto."
                ]
              }
            ]
          }
    };

    // Función para manejar el cambio de sección al hacer clic
    const handleTagClick = (sectionKey) => {
        setSelectedSection(sectionKey);
    };

    const selectedData = politicaData[selectedSection];

    return (
        <section className="politica-section">
            <div className="politica-container">
                <img src="/assets/img/contact_globe.svg" alt="" class="testi-globe1" />
                <img src="/assets/img/contact_globe.svg" alt="" class="testi-globe2" />
                <div className="politica-header">
                    <img src="/landing-preview/img/politicas-seguridad.webp" alt="Política de Privacidad" className="politica-header-img" />
                    <div className="textplayconsole">
                        <a href="/">INICIO {'\u00A0'}</a>
                        <p>|{'\u00A0'}{'\u00A0'}Políticas Play Console</p>
                    </div>
                    <div className="politica-header-overlay">
                        <h1>{selectedData.titulo}</h1>
                    </div>
                </div>

                <div className="politica-content">
                    {/* Aquí colocamos las etiquetas de las secciones */}
                    <div className="politica-tags">
                        <span className="tag" onClick={() => handleTagClick('privacidadApp')}>Política de Privacidad Aplicaciones</span>
                        <span className="tag" onClick={() => handleTagClick('privacidadWeb')}>Política de Privacidad Web</span>
                        <span className="tag" onClick={() => handleTagClick('terminos')}>Términos y Condiciones</span>
                    </div>


                    {/* Mostrar el contenido de la sección seleccionada */}
                    {selectedData.secciones.map((seccion, index) => (
                        <div key={index}>
                            <h4 className="politica-subtitle">{seccion.titulo}</h4>
                            {/* Mostrar la descripción si existe */}
                            {seccion.descripcion && (
                                <p className="politica-descripcion">{seccion.descripcion}</p>
                            )}
                            {Array.isArray(seccion.contenido) ? (
                                <ul>
                                    {seccion.contenido.map((item, idx) => (
                                        <li
                                            key={idx}
                                            dangerouslySetInnerHTML={{ __html: item }}
                                        />
                                    ))}
                                </ul>
                            ) : (
                                <p dangerouslySetInnerHTML={{ __html: seccion.contenido }} />
                            )}
                        </div>
                    ))}

                </div>
            </div>
        </section>
    );
};

export default PoliticaContenido;
