"use client";
import React from "react";

export interface ContratoData {
  tipo: "simplificado" | "modular";
  clienteNombre: string;
  clienteRuc: string;
  clienteRepresentante: string;
  clienteEmail: string;
  proyectoDescripcion: string;
  proyectoFuncionalidades: string;
  proyectoExclusiones: string;
  montoTotal: string;
  hitoPorcentaje1: string;
  hitoPorcentaje2: string;
  hitoPorcentaje3: string;
  diasUAT: string;
  modalidadIP: "estandar" | "propiedad";
}

export const INITIAL_DATA: ContratoData = {
  tipo: "simplificado",
  clienteNombre: "",
  clienteRuc: "",
  clienteRepresentante: "",
  clienteEmail: "",
  proyectoDescripcion: "",
  proyectoFuncionalidades: "",
  proyectoExclusiones: "",
  montoTotal: "",
  hitoPorcentaje1: "",
  hitoPorcentaje2: "",
  hitoPorcentaje3: "",
  diasUAT: "",
  modalidadIP: "estandar",
};

const PRESTADOR = {
  nombre: "Undercodeec",
  ruc: "---",
  email: "undercodeec@gmail.com",
  direccion: "Quito, Ecuador",
};

const today = () => {
  const d = new Date();
  return d.toLocaleDateString("es-EC", { year: "numeric", month: "long", day: "numeric" });
};

interface Props { data: ContratoData; }

const V = ({ v }: { v: string }) => (
  <span className="contratos-pdf__field-value">{v || "_______________"}</span>
);

export default function ContratoPDF({ data }: Props) {
  const isSimp = data.tipo === "simplificado";

  return (
    <div className="contratos-pdf" id="contrato-pdf-render">
      {/* Header */}
      <div className="contratos-pdf__header">
        <div className="contratos-pdf__logo">UNDERCODEEC</div>
        <div className="contratos-pdf__doc-title">
          {isSimp
            ? "Contrato de Desarrollo de Software Simplificado"
            : "Estructura Contractual Modular — Proyecto de Software"}
        </div>
        <div className="contratos-pdf__doc-sub">Fecha de generación: {today()}</div>
      </div>

      {/* ── SIMPLIFICADO ────────────────────────────── */}
      {isSimp && (
        <>
          {/* I */}
          <div className="contratos-pdf__section">
            <div className="contratos-pdf__section-title">
              <span className="contratos-pdf__section-roman">I.</span>
              Identificación Digital de las Partes
            </div>
            <div className="contratos-pdf__highlight">
              <div className="contratos-pdf__highlight-label">El Prestador</div>
              <p className="contratos-pdf__text">
                <strong>{PRESTADOR.nombre}</strong>, con RUC {PRESTADOR.ruc},
                correo electrónico {PRESTADOR.email} y domicilio en {PRESTADOR.direccion}.
              </p>
            </div>
            <div className="contratos-pdf__highlight">
              <div className="contratos-pdf__highlight-label">El Cliente</div>
              <p className="contratos-pdf__text">
                <strong><V v={data.clienteNombre} /></strong>, con NIF/RUC <V v={data.clienteRuc} />,
                representado por <V v={data.clienteRepresentante} />, correo electrónico <V v={data.clienteEmail} />.
              </p>
            </div>
          </div>

          {/* II */}
          <div className="contratos-pdf__section">
            <div className="contratos-pdf__section-title">
              <span className="contratos-pdf__section-roman">II.</span>
              Alcance del Proyecto (Scope)
            </div>
            <p className="contratos-pdf__text">
              El Prestador se compromete a desarrollar: <strong><V v={data.proyectoDescripcion} /></strong>.
            </p>
            <p className="contratos-pdf__text">
              Requerimientos incluidos: <strong><V v={data.proyectoFuncionalidades} /></strong>.
            </p>
            <div className="contratos-pdf__highlight">
              <div className="contratos-pdf__highlight-label">Exclusiones Estrictas</div>
              <p className="contratos-pdf__text">
                Cualquier funcionalidad no listada se considera fuera de alcance.
                Se excluye específicamente: <V v={data.proyectoExclusiones} />.
              </p>
            </div>
          </div>

          {/* III */}
          <div className="contratos-pdf__section">
            <div className="contratos-pdf__section-title">
              <span className="contratos-pdf__section-roman">III.</span>
              Modelo de Facturación y Pagos
            </div>
            <p className="contratos-pdf__text">
              El precio total es de <strong><V v={data.montoTotal} /> + Impuestos</strong>, bajo la modalidad de <strong>Precio Fijo</strong>.
            </p>
            <table className="contratos-pdf__table">
              <thead><tr><th>Hito / Entregable</th><th>Porcentaje</th></tr></thead>
              <tbody>
                <tr><td>Firma del contrato e inicio</td><td><V v={data.hitoPorcentaje1} />%</td></tr>
                <tr><td>Entrega de versión Beta para pruebas</td><td><V v={data.hitoPorcentaje2} />%</td></tr>
                <tr><td>Aceptación Técnica y Lanzamiento</td><td><V v={data.hitoPorcentaje3} />%</td></tr>
              </tbody>
            </table>
          </div>

          {/* IV */}
          <div className="contratos-pdf__section">
            <div className="contratos-pdf__section-title">
              <span className="contratos-pdf__section-roman">IV.</span>
              Propiedad Intelectual y Código Fuente
            </div>
            <p className="contratos-pdf__text">
              La titularidad de los derechos de propiedad intelectual se regirá por las siguientes reglas:
            </p>
            {data.modalidadIP === "estandar" ? (
              <div className="contratos-pdf__highlight">
                <div className="contratos-pdf__highlight-label">Modalidad Estándar</div>
                <p className="contratos-pdf__text">
                  El Prestador otorga una Licencia de Uso no exclusiva para operar el software.
                  El Prestador retiene la propiedad íntegra del código fuente.
                </p>
              </div>
            ) : (
              <div className="contratos-pdf__highlight">
                <div className="contratos-pdf__highlight-label">Modalidad de Propiedad</div>
                <p className="contratos-pdf__text">
                  El Prestador transferirá la propiedad total y exclusiva del código fuente al Cliente
                  tras el pago del 100% de los honorarios, incluyendo el rubro de &quot;Adquisición de Código Fuente&quot;.
                </p>
              </div>
            )}
          </div>

          {/* V */}
          <div className="contratos-pdf__section">
            <div className="contratos-pdf__section-title">
              <span className="contratos-pdf__section-roman">V.</span>
              Acta de Aceptación Técnica (UAT)
            </div>
            <p className="contratos-pdf__text">
              Tras la entrega, el Cliente tiene <strong><V v={data.diasUAT} /> días</strong> para reportar fallos.
              Si no hay comunicación en dicho plazo, se entiende por aceptado el proyecto para el pago final.
            </p>
          </div>

          {/* VI */}
          <div className="contratos-pdf__section">
            <div className="contratos-pdf__section-title">
              <span className="contratos-pdf__section-roman">VI.</span>
              Confidencialidad y Protección de Datos
            </div>
            <p className="contratos-pdf__text">
              Ambas partes se obligan a proteger la información sensible. El Prestador cumplirá
              con la normativa de protección de datos en el manejo de la información del Cliente.
            </p>
          </div>
        </>
      )}

      {/* ── MODULAR ─────────────────────────────────── */}
      {!isSimp && (
        <>
          {/* Parties */}
          <div className="contratos-pdf__section">
            <div className="contratos-pdf__section-title">Identificación de las Partes</div>
            <div className="contratos-pdf__highlight">
              <div className="contratos-pdf__highlight-label">El Prestador</div>
              <p className="contratos-pdf__text">
                <strong>{PRESTADOR.nombre}</strong>, RUC {PRESTADOR.ruc}, {PRESTADOR.email}, {PRESTADOR.direccion}.
              </p>
            </div>
            <div className="contratos-pdf__highlight">
              <div className="contratos-pdf__highlight-label">El Cliente</div>
              <p className="contratos-pdf__text">
                <strong><V v={data.clienteNombre} /></strong>, NIF/RUC <V v={data.clienteRuc} />,
                representado por <V v={data.clienteRepresentante} />, email <V v={data.clienteEmail} />.
              </p>
            </div>
          </div>

          {/* NDA */}
          <div className="contratos-pdf__module">
            <div className="contratos-pdf__module-num">2.1</div>
            <div className="contratos-pdf__module-title">Acuerdo de Confidencialidad (NDA)</div>
            <p className="contratos-pdf__module-text">
              Documento independiente vinculado a la fase de negociación. Prohíbe la divulgación
              de secretos industriales, algoritmos y estrategias comerciales bajo pena de sanciones económicas.
            </p>
          </div>

          {/* MSA */}
          <div className="contratos-pdf__module">
            <div className="contratos-pdf__module-num">2.2</div>
            <div className="contratos-pdf__module-title">Contrato Marco de Servicios (MSA)</div>
            <p className="contratos-pdf__module-text">Establece las reglas permanentes de la relación:</p>
            <ul className="contratos-pdf__bullets">
              <li><strong>Propiedad Intelectual:</strong> Sigue la lógica de &quot;Pago por Código = Propiedad&quot;.</li>
              <li><strong>Limitación de Responsabilidad:</strong> Topada al monto pagado en los últimos 6 meses.</li>
              <li><strong>Resolución de Disputas:</strong> Sometimiento a arbitraje digital o tribunales específicos.</li>
            </ul>
          </div>

          {/* SOW */}
          <div className="contratos-pdf__module">
            <div className="contratos-pdf__module-num">2.3</div>
            <div className="contratos-pdf__module-title">Declaración de Trabajo (SOW)</div>
            <p className="contratos-pdf__module-text">
              Proyecto: <strong><V v={data.proyectoDescripcion} /></strong>
            </p>
            <p className="contratos-pdf__module-text">
              Anexo operativo bajo modelo Time &amp; Materials. Define las tarifas por hora, el equipo asignado
              y los ciclos de entrega (Sprints).
            </p>
          </div>

          {/* SLA */}
          <div className="contratos-pdf__module">
            <div className="contratos-pdf__module-num">2.4</div>
            <div className="contratos-pdf__module-title">Acuerdo de Nivel de Servicio (SLA)</div>
            <table className="contratos-pdf__table">
              <thead><tr><th>Prioridad</th><th>Respuesta</th><th>Resolución</th></tr></thead>
              <tbody>
                <tr><td><strong>Crítica</strong> (Caída total)</td><td>&lt; 2 horas</td><td>&lt; 8 horas</td></tr>
                <tr><td><strong>Alta</strong> (Fallo parcial)</td><td>&lt; 8 horas</td><td>&lt; 24 horas</td></tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── DIGITAL ACCEPTANCE (both) ───────────────── */}
      <div className="contratos-pdf__acceptance">
        <div className="contratos-pdf__acceptance-title">Consentimiento y Aceptación Digital</div>
        <div className="contratos-pdf__quote">
          &ldquo;Al hacer clic en &lsquo;Aceptar&rsquo;, usted reconoce que ha leído la totalidad
          de este contrato y acepta quedar vinculado legalmente por sus términos. Esta acción
          constituye una firma electrónica con plenos efectos jurídicos de acuerdo con la
          legislación vigente en materia de comercio electrónico.&rdquo;
        </div>
        <div className="contratos-pdf__reqs">
          <div className="contratos-pdf__req">Registro de Log de Auditoría (IP, Fecha, Hora).</div>
          <div className="contratos-pdf__req">Acceso previo obligatorio al documento (Scroll).</div>
          <div className="contratos-pdf__req">Envío automático del contrato firmado en PDF al correo electrónico del cliente.</div>
        </div>
      </div>

      {/* Signatures */}
      <div className="contratos-pdf__sig-area">
        <div className="contratos-pdf__sig-block">
          <div className="contratos-pdf__sig-label">El Prestador</div>
          <div className="contratos-pdf__sig-name">{PRESTADOR.nombre}</div>
        </div>
        <div className="contratos-pdf__sig-block">
          <div className="contratos-pdf__sig-label">El Cliente</div>
          <div className="contratos-pdf__sig-name">{data.clienteRepresentante || "_______________"}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="contratos-pdf__footer">
        <p className="contratos-pdf__footer-text">
          © {new Date().getFullYear()} Undercodeec — Documento generado digitalmente. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
