# Reglas Persistentes del Proyecto ALMA Real State (First Real State)

Estas reglas son de cumplimiento **OBLIGATORIO** para cualquier agente de IA o desarrollador que interactúe con este repositorio. Su objetivo es mantener un estándar de calidad Enterprise, garantizando escalabilidad, seguridad y una experiencia de usuario (UX) premium.

## REGLA INAMOVIBLE 1: APO (Auditoría Profunda Obligatoria) y Planning Mode Estricto
Quedan estrictamente prohibidos los "hotfixes" ciegos o rápidos. **NINGÚN CAMBIO ES TRIVIAL.** Queda rotundamente prohibido aplicar la excepción de "cambios rápidos de UI" o "ajustes menores". Antes de realizar CUALQUIER modificación a una lógica existente, el agente DEBE obligatoriamente:
1. **Mapeo del Grafo de Impacto Global:** Antes de cambiar la lógica de un componente (ej. `AgentPortal.tsx`), el agente no puede solo modificar la UI. Debe rastrear el impacto en el estado global (Context API: `AuthContext.tsx`, `PropertyContext.tsx`), en los tipos (`types.ts`) y en las llamadas a base de datos (`firebase.ts`).
2. **Identificación Previa de Efectos Secundarios:** El agente debe documentar y listar explícitamente qué otros módulos se verán alterados. No se permite descubrir dependencias "sobre la marcha".
3. **Planning Mode Multi-Archivo (SIEMPRE):** Presentar un Plan de Implementación formal que detalle el diagnóstico técnico global si el cambio afecta la lógica core o la base de datos de producción (Firebase).

## REGLA INAMOVIBLE 2: HRU (Cero Hardcoding, Cero Regresiones, Reusabilidad Total)
Todo desarrollo, ajuste o refactorización debe regirse por el estándar HRU:
- **Cero Hardcoding:** Prohibido "quemar" precios, estados de propiedades (ej. 'VENDIDO', 'DISPONIBLE') o URLs en el código. Todo debe venir de `constants.ts` o Firebase.
- **Cero Regresiones:** Cualquier ajuste debe asegurar que la funcionalidad existente no se rompa.
- **Universalidad Total:** Reutilización de componentes. Si se crea una tarjeta de propiedad (Property Card) para el listado público, debe ser el mismo componente subyacente que se usa en el CRM del agente, solo variando las *props* de visualización.

## REGLA INAMOVIBLE 3: Arquitectura Anti-God-Object y Componentización Estricta
Queda estrictamente prohibido generar archivos masivos o acumular lógica de negocio en un solo componente o clase.
- **Delegación Obligatoria:** Si un componente de React (ej. `AgentPortal.tsx` o `App.tsx`) empieza a manejar la vista, la lógica de negocio y las llamadas a Firebase al mismo tiempo, se DEBE extraer la lógica a *Custom Hooks* (ej. `useAgentProperties()`) y delegar la UI a componentes más pequeños (ej. `<AgentDashboardStats />`).
- **Cero Tolerancia a Archivos Monstruo:** El agente debe proponer refactorización antes de inyectar más código a archivos que ya superen métricas saludables (ej. > 400-500 líneas en React).

## REGLA INAMOVIBLE 4: U-First y "Efecto WOW" Inmobiliario (Prioridad Máxima)
Todo desarrollo o refactorización debe tener como máxima prioridad la experiencia del usuario final (UX).
- **Cero Callejones sin Salida (Frictionless):** Si una búsqueda (normal o con IA) no devuelve propiedades, el sistema nunca debe mostrar una pantalla vacía. Debe ofrecer siempre una salida interactiva (ej. botón de "Contactar Agente" o "Propiedades similares").
- **Efecto WOW:** Uso intensivo de Tailwind CSS para lograr diseños premium (glassmorphism, transiciones suaves, diseño responsivo elegante). Las interfaces deben sentirse vivas y profesionales. El usuario jamás debe ver errores técnicos, IDs crudos de BD o JSONs en pantalla.

## REGLA INAMOVIBLE 5: SSD (Seguridad por Diseño y Aislamiento de Roles)
Toda refactorización o nueva funcionalidad debe alinearse con la seguridad por diseño, considerando los roles del sistema (Usuario, Agente, Admin).
- **Zero Trust en Firebase:** Un cliente público nunca debe poder leer los datos del CRM de un agente o configuraciones internas.
- **Filtro de Payloads y Sanitización de Contexto:** Al consultar a la IA (Gemini), se debe sanitizar la información. El chatbot público NO debe tener en su contexto información interna y privada (ej. números personales de propietarios, comisiones de los agentes).

## REGLA INAMOVIBLE 6: SQA e Idempotencia Transaccional
Para mitigar riesgos operativos, especialmente en transacciones de bases de datos.
- **Idempotencia en UI y BD:** En la gestión inmobiliaria, un doble clic no puede generar datos duplicados. Al cambiar un estado (ej. "Reservar propiedad", "Asignar Lead"), la interfaz debe bloquear inmediatamente la acción (loading state) y la lógica debe prevenir la duplicidad.

## REGLA INAMOVIBLE 7: Optimización de Contexto IA (Economía de Tokens para Gemini)
Dado que ALMA utiliza Google Gemini, los recursos de la API (tokens y costos) son críticos.
- **Context Economy:** No enviar colecciones masivas de datos a la IA en cada petición. Filtrar previamente la información localmente o en base de datos (Firestore) y *solo inyectar* a Gemini el contexto estrictamente necesario y más relevante para la consulta del usuario.

## REGLA INAMOVIBLE 8: Arquitectura de Doble Extracción (Respuestas Rápidas vs Análisis)
- **Capa 1 (Inmediata):** Búsquedas rápidas con filtros tradicionales (Precio, Habitaciones, etc.) deben resolverse instantáneamente.
- **Capa 2 (Táctica con IA):** Búsquedas complejas ("Smart Search" semántico) pueden tomar más tiempo utilizando procesamiento en segundo plano o asíncrono, garantizando que la UI muestre un estado de carga elegante sin bloquear la experiencia del usuario.

## REGLA INAMOVIBLE 9: Protocolo de Descubrimiento de Código TypeScript (Cero Parches Iterativos)
Para solucionar de raíz el avance lento ocasionado por correcciones reactivas en cadena:
- **Inspección Obligatoria de Contratos:** El agente tiene la obligación absoluta de leer las interfaces en `types.ts` para entender el modelo de datos antes de proponer cambios.
- **Planes Consolidados:** Si se modifica o agrega un campo, el agente debe actualizar la interfaz central y usar TypeScript para identificar dónde más se requiere el cambio, creando una solución consolidada en lugar de parchar errores uno por uno.
