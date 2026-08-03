# Automatización del Contrato Simplificado

Rediseñar el flujo del contrato simplificado para que el usuario solo ingrese datos personales esenciales. Todo lo relacionado al proyecto (descripción, funcionalidades, monto, hitos de pago) se llenará automáticamente al seleccionar un plan web y una modalidad de pago.

## Propuesta de Cambios

### Nuevo Flujo del Wizard (3 pasos)

| Paso | Antes | Después |
|:---:|:---|:---|
| **0** | Elegir tipo de contrato (Simplificado / Modular) | Sin cambios |
| **1** | Formulario manual de datos del cliente + proyecto + facturación + IP | **Rediseñado**: Datos del cliente + Selector de Plan + Modalidad de Pago + IP |
| **2** | Previsualización + Descarga PDF | Sin cambios |

### Paso 1 — Nuevo Diseño del Formulario

El formulario del paso 1 para el contrato simplificado se reorganizará en **4 secciones**:

#### Sección 1: Datos del Cliente (campos manuales)
| Campo | Tipo | Notas |
|:---|:---|:---|
| Nombre / Razón Social | text | Ya existe |
| Cédula / RUC | text | **Renombrado** (antes era solo "NIF / RUC") |
| Representante Legal | text | Ya existe |
| Correo Electrónico | email | Ya existe |
| Dirección | text | **Nuevo campo** |

#### Sección 2: Selección de Plan (tarjetas clickeables)
Se mostrarán **3 tarjetas** con los planes de Sitio Web extraídos de `wizard-config.json`:

| Plan | Precio | Incluye |
|:---|:---|:---|
| Plan de Lanzamiento | $360 | Diseño adaptado, 5-10 páginas, Mobile-first, SEO técnico, Formularios + WhatsApp, SSL + Hosting |
| Plan de Crecimiento | $510 | Todo lo anterior + Diseño CRO, SEO Avanzado, Core Web Vitals, CRM + Analytics, Copywriting |
| Plan de Autoridad | $1,010 | Todo lo anterior + UX/UI a medida, Integraciones complejas, Chatbots IA, Arquitectura escalable |

> [!IMPORTANT]
> Se usará el precio mínimo (`min`) de cada rango como precio fijo del plan. ¿Estás de acuerdo con estos precios o prefieres ajustarlos?

Al seleccionar un plan, se auto-llenará en el contrato:
- **Descripción del proyecto**: Nombre del plan + su descripción
- **Funcionalidades**: Lista de features del plan
- **Exclusiones**: Texto genérico: *"Cualquier funcionalidad no listada. Se excluye: contenido multimedia, hosting de terceros, campañas de marketing pagado."*
- **Monto total**: Precio del plan
- **Días UAT**: 15 días (valor por defecto)

#### Sección 3: Modalidad de Pago (radio buttons)
| Opción | Distribución de Hitos |
|:---|:---|
| **Pago Total (Contado)** | Hito 1: 100% — Firma e inicio del proyecto |
| **Pago en Dos Partes** | Hito 1: 50% — Firma e inicio · Hito 2: 50% — Entrega y aceptación |

#### Sección 4: Propiedad Intelectual (radio buttons)
Sin cambios — El usuario elige entre **Licencia de Uso** o **Transferencia Total**.

---

## Cambios Propuestos por Archivo

### Datos

#### [MODIFY] [wizard-config.json](file:///d:/Documentos/bakup%20mi%20portafolio/mi%20portafolio/undercodeec_nextjs/src/data/Preview/wizard-config.json)
- Sin modificaciones. Se importará la sección `sitioWeb.budgetRanges` como fuente de planes.

---

### Modelo de Datos

#### [MODIFY] [ContratoPDF.tsx](file:///d:/Documentos/bakup%20mi%20portafolio/mi%20portafolio/undercodeec_nextjs/src/components/Contratos/ContratoPDF.tsx)

Actualizar la interfaz `ContratoData`:

```diff
 interface ContratoData {
   tipo: "simplificado" | "modular";
   clienteNombre: string;
-  clienteRuc: string;
+  clienteCedulaRuc: string;
   clienteRepresentante: string;
   clienteEmail: string;
+  clienteDireccion: string;
+  planSeleccionado: string;        // "lanzamiento" | "crecimiento" | "autoridad" | ""
+  modalidadPago: "contado" | "mitad";
   proyectoDescripcion: string;     // Auto-llenado
   proyectoFuncionalidades: string; // Auto-llenado
   proyectoExclusiones: string;     // Auto-llenado
   montoTotal: string;              // Auto-llenado
-  hitoPorcentaje1: string;         // Auto-llenado
-  hitoPorcentaje2: string;         // Auto-llenado
-  hitoPorcentaje3: string;         // Eliminado (solo 2 hitos máximo)
+  hitoPorcentaje1: string;         // Auto-llenado (100% o 50%)
+  hitoPorcentaje2: string;         // Auto-llenado (0% o 50%)
   diasUAT: string;                 // Auto-llenado (15)
   modalidadIP: "estandar" | "propiedad";
 }
```

Actualizar la plantilla del PDF:
- Usar `clienteCedulaRuc` en vez de `clienteRuc`
- Agregar `clienteDireccion` en la sección de partes
- La tabla de hitos mostrará 1 o 2 filas según la modalidad de pago
- Mostrar el nombre del plan seleccionado en la sección de Alcance

---

### Lógica del Formulario

#### [MODIFY] [ContratosContent.tsx](file:///d:/Documentos/bakup%20mi%20portafolio/mi%20portafolio/undercodeec_nextjs/src/components/Contratos/ContratosContent.tsx)

1. **Importar** los planes de `wizard-config.json`
2. **Rediseñar `StepForm`** para el contrato simplificado:
   - Sección "Datos del Cliente": 5 campos (añadir dirección, renombrar cédula/RUC)
   - Sección "Plan Web": 3 tarjetas seleccionables
   - Sección "Modalidad de Pago": 2 radio buttons (contado / mitad)
   - Sección "Propiedad Intelectual": Sin cambios
   - **Eliminar**: campos manuales de descripción, funcionalidades, exclusiones, monto, hitos, días UAT
3. **Auto-fill logic**: Función que al seleccionar un plan y modalidad, calcule y rellene automáticamente todos los campos del contrato
4. **Validación**: Solo validar los campos que el usuario llena manualmente (datos del cliente)

---

## Verificación

### Pruebas Manuales
1. Seleccionar contrato simplificado → verificar que aparecen los 3 planes
2. Seleccionar un plan → verificar que los datos se auto-llenan
3. Cambiar modalidad de pago → verificar que los hitos cambian
4. Avanzar al paso 2 → verificar que el PDF se genera con todos los datos
5. Descargar PDF → verificar que el archivo se genera correctamente
6. Probar validación → verificar que se requieren los campos del cliente

### Build
- Ejecutar `npm run build` para verificar compilación sin errores
