# Flujo de Desarrollo: Módulo de Facturación Electrónica SRI (Ecuador)

Objetivo: convertir el Admin Dashboard en un administrador de facturas que permita **emitir facturas electrónicas autorizadas por el SRI** de forma automática, autocompletando los datos de facturación que el cliente ya llenó en el wizard de planes (`/#planes`), con opción de ingreso manual.

**Decisiones tomadas (2026-06-10):**
- Integración **directa** con los web services del SRI (sin intermediarios de pago).
- Firma con certificado **.p12 propio** (ya disponible, con contraseña).
- Desarrollo y certificación primero en **ambiente de pruebas** del SRI, luego switch a producción.

---

## 1. Fundamentos técnicos (investigación)

### 1.1 Cómo funciona la facturación electrónica del SRI (esquema offline)

1. **Generar XML** de la factura según la Ficha Técnica de Comprobantes Electrónicos (esquema offline, XSD oficial — versión vigente 2.32, nov 2025). Tipo de comprobante factura = `01`, versión de esquema `1.1.0` (o `2.1.0`).
2. **Clave de acceso (49 dígitos)** — identificador único del comprobante:
   `fechaEmision(ddmmaaaa) + tipoComprobante(01) + RUC(13) + ambiente(1) + serie(estab 3 + ptoEmi 3) + secuencial(9) + códigoNumérico(8) + tipoEmision(1) + dígitoVerificador(módulo 11)`
3. **Firmar el XML** con firma digital **XAdES-BES** usando el certificado `.p12` (emitido por Security Data, Banco Central, UANATACA, ANF, etc.).
4. **Enviar al web service de Recepción** (SOAP). Respuesta: `RECIBIDA` o `DEVUELTA` (con lista de errores).
5. **Consultar el web service de Autorización** (SOAP) con la clave de acceso. Respuesta: `AUTORIZADO` o `NO AUTORIZADO` + número y fecha de autorización.
6. **Generar el RIDE** (representación impresa en PDF, con código de barras/QR de la clave de acceso) y **enviar al cliente por email** el XML autorizado + RIDE (obligación del emisor).

### 1.2 Endpoints SOAP del SRI

| Ambiente | Recepción | Autorización |
|---|---|---|
| **Pruebas (1)** | `https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl` | `https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl` |
| **Producción (2)** | `https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl` | `https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl` |

### 1.3 Normativa clave 2026

- **Resolución NAC-DGERCGC25-00000017**: desde el **1 de enero de 2026** los comprobantes deben transmitirse al SRI **en el momento de su emisión** (ya no en lote al final del día). Nuestro flujo emite y transmite inmediatamente, así que cumple por diseño.
- IVA vigente: **15%** (código de porcentaje `4` en el XML). Tarifa 0% = código `0`.

### 1.4 Catálogos del SRI que usaremos

| Campo | Códigos |
|---|---|
| `tipoIdentificacionComprador` | `04` RUC · `05` Cédula · `06` Pasaporte · `07` Consumidor Final |
| `codigoPorcentaje` IVA | `0` (0%) · `4` (15%) |
| `formaPago` | `19` Tarjeta de crédito · `20` Otros con utilización del sistema financiero (transferencia) · `01` Sin utilización del sistema financiero |
| `ambiente` | `1` Pruebas · `2` Producción |
| `tipoEmision` | `1` Normal |

### 1.5 Librería elegida: `open-factura` (open source, npm)

Cubre todo el ciclo en Node.js: tipado de campos según ficha técnica del SRI, generación del JSON/XML de la factura, **clave de acceso**, **firma XAdES-BES con .p12**, y funciones `documentReception()` / `documentAuthorization()` para los SOAP del SRI.

- Repo: https://github.com/miguelangarano/open-factura
- Si algún punto de la librería queda corto (p. ej. RIDE), se complementa con generación propia de PDF (el backend ya usa Puppeteer, sirve para renderizar el RIDE desde una plantilla HTML).

### 1.6 Requisitos previos (checklist del emisor)

- [x] RUC activo y habilitado para emitir comprobantes electrónicos en SRI en Línea (el usuario ya factura electrónicamente con el SRI).
- [x] Certificado de firma electrónica `.p12` vigente + contraseña.
- [ ] Definir datos del emisor: razón social, nombre comercial, dirección matriz, establecimiento (`001`), punto de emisión (ej. `002` para diferenciar de la facturación manual existente), obligado a llevar contabilidad (SI/NO), régimen (RIMPE si aplica).
- [ ] Verificar en SRI en Línea el último secuencial usado para no colisionar con facturas ya emitidas (cada serie estab+ptoEmi lleva su propio secuencial — usar un punto de emisión nuevo evita colisiones).

---

## 2. Arquitectura propuesta

```
Dashboard (tab "Facturas")
   │  POST /api/admin/invoices  (datos autocompletados desde el pago, o manuales)
   ▼
backend/invoicing/ (módulo nuevo)
   ├── invoiceBuilder.js   → arma JSON factura (emisor .env + comprador + items) → open-factura → XML + clave de acceso
   ├── signer.js           → firma XAdES-BES con .p12 (ruta y password en .env, fuera del repo)
   ├── sriClient.js        → recepción + autorización SOAP (con reintentos y timeout)
   ├── ride.js             → genera RIDE PDF (plantilla HTML + Puppeteer ya disponible)
   └── mailer.js           → envía XML + RIDE al email del cliente (transporter existente)
   ▼
MySQL tabla `invoices` (estado, clave_acceso, xml, autorización, etc.)
```

### 2.1 Nueva tabla `invoices`

```sql
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NULL,                -- FK lógica a orders (NULL si es factura manual)
  ambiente TINYINT NOT NULL,        -- 1 pruebas, 2 producción
  estab VARCHAR(3) NOT NULL,
  pto_emi VARCHAR(3) NOT NULL,
  secuencial INT NOT NULL,          -- secuencial numérico de la serie
  clave_acceso VARCHAR(49) UNIQUE,
  estado VARCHAR(30) NOT NULL DEFAULT 'generada',
  -- generada | firmada | recibida | devuelta | autorizada | no_autorizada | error
  -- Comprador
  tipo_identificacion VARCHAR(2) NOT NULL,   -- 04/05/06/07
  identificacion VARCHAR(20) NOT NULL,
  razon_social VARCHAR(300) NOT NULL,
  direccion VARCHAR(300),
  email VARCHAR(255),
  telefono VARCHAR(50),
  -- Detalle y montos
  items JSON NOT NULL,              -- [{descripcion, cantidad, precioUnitario, descuento, codigoPorcentajeIva}]
  forma_pago VARCHAR(2) NOT NULL,   -- 19/20/01
  subtotal DECIMAL(12,2) NOT NULL,
  iva DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  -- Resultado SRI
  numero_autorizacion VARCHAR(49),
  fecha_autorizacion DATETIME NULL,
  mensajes_sri JSON,                -- errores/advertencias devueltos por el SRI
  xml_firmado LONGTEXT,             -- XML firmado (y luego autorizado)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

El secuencial se calcula como `MAX(secuencial)+1` por serie (`ambiente+estab+pto_emi`) dentro de una transacción, arrancando desde `SRI_SECUENCIAL_INICIO`.

### 2.2 Variables de entorno nuevas (`backend/.env`)

```ini
# --- SRI Facturación Electrónica ---
SRI_AMBIENTE=1                  # 1=pruebas (celcer), 2=producción (cel)
SRI_RUC=...
SRI_RAZON_SOCIAL=...
SRI_NOMBRE_COMERCIAL=Undercodeec
SRI_DIR_MATRIZ=...
SRI_ESTAB=001
SRI_PTO_EMI=002
SRI_SECUENCIAL_INICIO=1
SRI_OBLIGADO_CONTABILIDAD=NO
SRI_CONTRIBUYENTE_RIMPE=        # texto leyenda si aplica (ej. CONTRIBUYENTE RÉGIMEN RIMPE)
SRI_P12_PATH=./secrets/firma.p12   # FUERA del repositorio (gitignore)
SRI_P12_PASSWORD=...
```

> Seguridad: el `.p12` se guarda en `backend/secrets/` (agregado a `.gitignore`); nunca se sube al repo ni se expone por HTTP. La contraseña solo vive en el `.env` del servidor.

### 2.3 Endpoints backend nuevos (todos con `adminAuth`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/admin/invoices` | Listado de facturas (estado, clave de acceso, totales). |
| POST | `/api/admin/invoices` | **Emitir factura**: recibe `{ orderId?, comprador, items, formaPago }` → genera XML → firma → recepción SRI → autorización → guarda → envía RIDE+XML al cliente. Devuelve estado final y mensajes del SRI. |
| POST | `/api/admin/invoices/:id/retry` | Reintenta recepción/autorización de una factura `devuelta`/`error` (sin regenerar secuencial si ya fue recibida). |
| GET | `/api/admin/invoices/:id/ride` | Descarga el RIDE (PDF). |
| GET | `/api/admin/invoices/:id/xml` | Descarga el XML autorizado. |

### 2.4 Dashboard: nuevo tab "Facturas"

1. **Listado** de facturas con: secuencial formateado (`001-002-000000123`), fecha, cliente, total, estado SRI (badge), acciones (RIDE, XML, reintentar).
2. **Botón "Emitir Factura"** → abre formulario modal:
   - **Autocompletado (por defecto):** selector "Desde un pago" que lista los pagos del tab Pagos; al elegir uno se rellenan automáticamente los campos desde `orders.client_info` (el wizard de `/#planes` ya captura: `rucCedula`, `razonSocial`, `tipoCliente`, `email`, `telefono`, dirección completa, `metodoPago`, plan y monto). El ítem de la factura se precarga con `plan_name` y `amount`; `formaPago` se deduce de `metodoPago` (tarjeta→19, transferencia→20).
   - **Manual:** todos los campos editables (tipo identificación, RUC/cédula, razón social, dirección, email, items con cantidad/precio/IVA).
   - Totales (subtotal, IVA 15%, total) calculados en vivo.
   - Validaciones: cédula 10 dígitos, RUC 13 dígitos terminado en 001, consumidor final = `9999999999999` (solo si total < límite vigente).
3. **Acceso directo:** en el modal de detalle de un pago (tab Pagos), botón **"Emitir factura"** que abre el formulario ya prellenado con ese pago.
4. Indicador visible del **ambiente activo** (badge "PRUEBAS" naranja / "PRODUCCIÓN" verde) para no confundir emisiones.

---

## 3. Fases de desarrollo

### Fase 1 — Infraestructura (backend)
- [ ] `pnpm add open-factura` en `backend/`.
- [ ] Crear tabla `invoices` en `db.js` (initDatabase) + documentar en `database_schema.sql`.
- [ ] Variables `.env` del emisor + carpeta `backend/secrets/` (gitignored) con el `.p12`.
- [ ] Módulo `backend/invoicing/` con builder de la estructura de factura (emisor desde env, IVA 15% código 4, clave de acceso).

### Fase 2 — Firma y comunicación con el SRI
- [ ] Firma XAdES-BES con el `.p12` (open-factura `signXml`).
- [ ] Cliente SOAP: recepción (`RECIBIDA`/`DEVUELTA`) y autorización (`AUTORIZADO`/`NO AUTORIZADO`), con timeout, reintentos (el SRI a veces tarda en autorizar: poll con backoff ~3 intentos) y registro de `mensajes_sri`.
- [ ] Manejo de estados en la tabla `invoices` en cada paso (trazabilidad completa).

### Fase 3 — Endpoints admin
- [ ] `POST /api/admin/invoices` (emisión completa, transaccional sobre el secuencial).
- [ ] `GET /api/admin/invoices`, `:id/xml`, `:id/retry`.
- [ ] Pruebas con `curl`/script contra ambiente de certificación del SRI.

### Fase 4 — RIDE y entrega al cliente
- [ ] Plantilla HTML del RIDE (formato estándar SRI: datos emisor, comprador, detalle, totales, clave de acceso con código de barras) renderizada a PDF con Puppeteer (cola `runWithPuppeteer` ya existente).
- [ ] `GET /api/admin/invoices/:id/ride`.
- [ ] Envío automático por email al cliente (XML + RIDE adjuntos) al quedar `autorizada`.

### Fase 5 — UI Dashboard
- [ ] Tab "Facturas": listado + badges de estado + acciones.
- [ ] Formulario de emisión con autocompletado desde pagos (por defecto) y modo manual.
- [ ] Botón "Emitir factura" en el detalle de cada pago.
- [ ] Badge de ambiente activo.

### Fase 6 — Certificación y paso a producción
- [ ] Emitir set de facturas de prueba en `celcer` (autorizadas, devueltas, consumidor final, con RUC).
- [ ] Verificar RIDE y XML contra una factura real emitida desde SRI en Línea.
- [ ] Cambiar `SRI_AMBIENTE=2`, confirmar secuenciales de producción, emitir primera factura real de bajo monto y validarla en SRI en Línea.

---

## 4. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Secuenciales duplicados con tu facturación manual existente | Usar un **punto de emisión nuevo** (`002`) exclusivo del sistema. |
| SRI caído / lento al autorizar | Estados intermedios en DB + endpoint `retry`; la factura firmada no se pierde. |
| Exposición del `.p12` | Fuera del repo, permisos restrictivos, password solo en `.env` del servidor. |
| Errores de esquema XML (DEVUELTA) | Validar campos antes de firmar; mostrar `mensajes_sri` completos en el dashboard. |
| Emitir en producción por error durante el desarrollo | `SRI_AMBIENTE=1` por defecto + badge de ambiente visible en la UI. |

---

## 5. Fuentes

- [Ficha técnica oficial de comprobantes electrónicos (esquema offline) — SRI](https://www.sri.gob.ec/o/sri-portlet-biblioteca-alfresco-internet/descargar/ed555352-46c7-4917-9f61-011b6a9f4600/FICHA%20TE%CC%81CNICA%20COMPROBANTES%20ELECTRO%CC%81NICOS%20ESQUEMA%20OFFLINE%20Versio%CC%81n%202.26.pdf)
- [Facturación Electrónica — Portal SRI](https://www.sri.gob.ec/en/facturacion-electronica)
- [open-factura (librería Node.js open source) — GitHub](https://github.com/miguelangarano/open-factura)
- [Artículo del autor de open-factura explicando el flujo completo](https://medium.com/@miguelangarano/al-fin-facturaci%C3%B3n-electr%C3%B3nica-para-devs-sri-ecuador-0aff3f562166)
- [mora-sri-gateway (referencia de arquitectura NestJS XAdES-BES + SOAP SRI)](https://github.com/Jairbal/mora-sri-gateway)
- [f-sri (sistema open source de facturación SRI, referencia)](https://github.com/sjcastillog/f-sri-2025-complete)
