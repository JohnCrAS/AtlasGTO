# Atlas de Riesgo para Mujeres Buscadoras de Guanajuato (MVP)

## 1) Objetivo del proyecto
Construir un **Atlas de Riesgo digital, simple y de bajo mantenimiento** que ayude a:
- **Visibilizar el fenómeno** de violencia y riesgos que enfrentan mujeres buscadoras (31 colectivos + ~50 personas independientes, según insumo del proyecto).
- **Guiar decisiones** de la Comisión de Búsqueda y otras autoridades (protección de periodistas, seguridad pública, salud, IMUG), con **capas combinables** y **recomendaciones accionables** por municipio.
- **Actualizar fácil** (panel de administración) y dejar capacidad instalada para alimentar nuevas variables.

## 2) Alcance del MVP
- **Mapa web** con capas activables y combinables.
- **Índice de riesgo (0–100)** por municipio, con metodología transparente y editable.
- **Panel de administración** para capturar/editar datos (colectivos, incidentes, oferta institucional, etc.).
- **Descargas** (CSV/JSON) y **ficha municipal** (PDF ligero) por municipio.
- **Bitácora de cambios** para trazabilidad.

## 3) Capas (datasets base)
> Todas las capas son opcionales/activables y se pueden combinar con controles tipo “checklist”.

1. **Colectivos e independientes** (agregado municipal): número de colectivos, cobertura, enlaces/atención. *Privacidad*: no mostrar domicilios ni coordenadas exactas.
2. **Incidentes contra mujeres buscadoras**: amenazas, agresiones, obstrucciones; variable binaria (sí/no) + conteo anual; nivel de exposición público **solo agregado**.
3. **Desapariciones**: conteo y tasa por 100 mil hab. por municipio y año (serie histórica para tendencia).
4. **Criminalidad letal**: homicidio doloso, feminicidio, secuestro, extorsión (tasa por 100 mil, acumulado 12 meses y variación anual).
5. **Huachicol / ejes de ductos**: tomas clandestinas (conteo y tasa por superficie) y **proximidad** a ductos/corredores de disputa.
6. **Pobreza/rezago social**: IRS/rezago municipal; útil como factor estructural de vulnerabilidad.
7. **Capacidad instalada**: presencia/ausencia y densidad de oferta institucional por municipio (Comisión de Búsqueda local, IMUG/IMM, Fiscalía, C5i, salud, refugios/atención).
8. **Eventos y alertas** (catálogo interno): registro de eventos relevantes (marchas, brigadas, hallazgos) con **desfase/obfuscación** de ubicación para no poner en riesgo operativos.

## 4) Metodología del Índice de Riesgo (editable)
**Objetivo:** estimar la *exposición relativa al riesgo* para mujeres buscadoras por municipio.

**Variables sugeridas (normalizadas 0–1 o Z-score):**
- V1. Tasa de **incidentes contra buscadoras** (peso 0.30).
- V2. **Tasa de desapariciones** por 100 mil (0.20).
- V3. **Tasa de homicidio doloso** (0.15).
- V4. **Huachicol**: tomas clandestinas por 100 km² y **proximidad a ductos** (0.15).
- V5. **Rezago social/IRS** (0.10).
- V6. **Capacidad instalada inversa** (0.10): a menor oferta/alcance, mayor riesgo.

**Fórmula (ejemplo):**
> Índice = 100 * [0.30·V1 + 0.20·V2 + 0.15·V3 + 0.15·V4 + 0.10·V5 + 0.10·(1 – cobertura institucional)]

**Notas:**
- Pesos **ajustables** en panel (guardados en tabla de configuración).
- Clasificación por **quintiles** y colores seguros (daltonismo friendly).
- Mostrar **incertidumbre** (semáforo de calidad de datos: alto/medio/bajo) y **tendencia** (flecha ↑ ↓ → a 12 meses).

## 5) Diseño funcional del mapa (UX)
- **Búsqueda** por municipio/colectivo.
- **Controles**: checklist de capas, selector de año/periodo, slider de pesos del índice (modo experto), botón “**Combinar capas**” (aplica mezcla y recalcula índice al vuelo).
- **Tooltip** municipal con: índice, top 3 factores, tendencia, botón “Ver ficha”.
- **Ficha municipal** (modal/descargable): gráfica de series (3 años), oferta institucional, recomendaciones y contactos.
- **Modo público** (solo agregados y variables estructurales) vs **modo institucional** (más detalle, con acceso).

## 6) Panel de administración (no-code/low-code)
**Vistas/tablas clave:**
- `colectivos_municipio`: {municipio, num_colectivos, cobertura_texto, contacto_institucional(opcional)}
- `incidentes_buscadoras`: {municipio, fecha, tipo_incidente, fuente, validación}
- `desapariciones_mun_mensual`: {municipio, año, mes, casos}
- `homicidio_mun_mensual`: {municipio, año, mes, tasa, casos}
- `tomas_clandestinas_mun`: {municipio, año, mes, tomas, superficie_km2}
- `rezago_municipal`: {municipio, irs_2020, quintil}
- `capacidad_instalada`: {municipio, comision_busqueda(0/1), imug/imm(0/1), fiscalia(0/1), c5i(0/1), centros_salud(n), observaciones}
- `config_pesos`: {variable, peso}
- `usuarios_roles`: {usuario, rol, 2FA}

**Funcionalidades:**
- Formularios sencillos (validaciones, catálogo de tipos de incidente).
- Importación CSV/Excel y actualización masiva.
- Historial (quién cambió qué, cuándo).

## 7) Flujo de actualización (simple)
1) **Carga mensual**: pegar/adjuntar CSV oficiales (incidencia, desapariciones, tomas).
2) **Validación**: tablero de diferencias (resalta cambios y valores atípicos).
3) **Publicación**: botón “Publicar” → genera **JSON/GeoJSON** optimizados y refresca el mapa.

## 8) Privacidad, seguridad y ética
- **Nada de geolocalización sensible** de buscadoras, domicilios o rutas.
- **Agregación municipal** como regla por defecto; eventos se muestran con **desfase** y **jitter** (ruido) cuando procede.
- **Accesos por rol** (público / institucional / admin) y **2FA**.
- **Licencias y fuentes** documentadas en metadatos; **disclaimer** sobre limitaciones del dato.
- **Backups automáticos** y retención (90 días).

## 9) Tecnologías sugeridas (bajo mantenimiento)
- **Mapa:** MapLibre/Leaflet + teselas públicas (OSM/OMT) — sin vendor lock-in.
- **Datos:**
  - Opción A (más simple): Google Sheets → build JSON; o CSV en Drive + script.
  - Opción B (robusta): **Supabase (Postgres + PostGIS)** con **NocoDB** como panel.
- **Hosting:** Netlify/Vercel (estático) + CDN.
- **ETL:** scripts ligeros (Python/Node) ejecutados on-demand o con GitHub Actions.

## 10) Entregables del MVP
- **Sitio del Atlas** (dominio propio o subdominio), con:
  - Mapa interactivo, capas, índice y fichas municipales.
  - Página de **Metodología** (editable) y **Diccionario de datos**.
- **Panel de administración** (roles, formularios, importador CSV/Excel).
- **Paquete de datos abiertos** (CSV/JSON) + **Guía de actualización** (PDF) + **Capacitación 2 h**.

## 11) Roadmap sugerido (rápido)
- **Semana 1**: normalizar datos, maqueta de mapa, estructura del índice, panel base.
- **Semana 2**: conectar ETL + panel, fichas municipales, pruebas de roles/seguridad y capacitación.

## 12) Recomendaciones prácticas
- Empezar con **5–7 variables sólidas** (las de arriba) y dejar listo el “**botón para agregar nuevas capas**”.
- Priorizar **usabilidad móvil** (consulta en campo) y **rendimiento** (GeoJSON simplificado).
- Incluir **semáforo de calidad** del dato por municipio y **enlaces de denuncia/atención**.

## 13) Indicadores de utilidad (qué mide el éxito)
- % de municipios con datos actualizados los últimos 60 días.
- Tiempo promedio desde carga de CSV hasta publicación.
- # de consultas mensuales y # de fichas descargadas.
- # de recomendaciones adoptadas por instituciones (seguimiento cualitativo).

---

### Apéndice A. Propuesta de “Ficha municipal”
**Encabezado**: Nombre del municipio | Índice 0–100 | Rangos (muy alto/alto/medio/bajo/muy bajo).  
**Bloque 1**: Tendencia 12 meses (desapariciones, homicidio) + semáforo de datos.  
**Bloque 2**: Top 3 factores que explican el riesgo (con contribución %).  
**Bloque 3**: Oferta institucional local (qué hay y qué falta).  
**Bloque 4**: Recomendaciones priorizadas (rápidas: 0–3 meses; estructurales: 3–12 meses).  
**Botones**: Descargar PDF | Copiar enlace | Reportar dato.

### Apéndice B. Matriz de recomendaciones (cruce índice × capacidad)
- **Alto riesgo + baja capacidad**: activación de protocolos de protección, botón de emergencia institucional, priorizar recursos móviles y rutas seguras.
- **Alto riesgo + alta capacidad**: refuerzo coordinado (C5i, Fiscalía, IMUG), células de respuesta con ventanilla única.
- **Medio/Bajo riesgo**: prevención focalizada y seguimiento de tendencias.

### Apéndice C. Glosario mínimo
- **Huachicol**: extracción ilegal de hidrocarburos (tomas clandestinas) y mercados asociados.  
- **Rezago social**: indicador compuesto (educación, salud, vivienda, servicios).  
- **Semáforo de calidad**: nivel de confianza del dato según fuente/actualidad.

---

**Listo para implementar.** Si hace falta, ajustamos pesos, colores y campos del panel conforme a su diagnóstico final (ya casi terminado) para mantener **coherencia** entre diagnóstico y atlas.



---

# Plan de Implementación — **Opción A (simple)** con ruta a **Opción B (robusta)**

## A. Arquitectura MVP (Opción A)
- **Frontend estático**: Leaflet/MapLibre + HTML/JS (Vercel/Netlify).
- **Datos fuente**: Google Sheets + carpeta de CSV en Google Drive (plantillas controladas).
- **Build de datos**: Script ligero (Python/Node) que convierte CSV a **GeoJSON/JSON** optimizados por municipio.
- **Publicación**: GitHub Actions (o botón manual) → genera `/data/*.json` y despliega el sitio.
- **Accesos**: Modo público (agregado) y **Vista institucional** protegida por contraseña (Netlify/Vercel Password Protect) para campos sensibles.

## B. Esquema de datos (plantillas CSV)
1) `colectivos_municipio.csv`
```
municipio,anio,num_colectivos,num_personas_independientes,observaciones
Irapuato,2025,3,5,"Cobertura regional"
```
2) `incidentes_buscadoras.csv`
```
municipio,fecha,tipo_incidente,fuente,validacion
Salamanca,2025-03-12,amenaza,"nota de prensa",validado
```
3) `desapariciones_mun_mensual.csv`
```
municipio,anio,mes,casos
León,2025,07,12
```
4) `homicidio_mun_mensual.csv`
```
municipio,anio,mes,casos,tasa_100k
Celaya,2025,07,18,6.2
```
5) `tomas_clandestinas_mun.csv`
```
municipio,anio,mes,tomas,superficie_km2
Villagrán,2025,06,9,291.5
```
6) `rezago_municipal.csv`
```
municipio,irs_2020,quintil
Pénjamo,-0.45,3
```
7) `capacidad_instalada.csv`
```
municipio,comision_busqueda,imug_imm,fiscalia,c5i,centros_salud,observaciones
Guanajuato,1,1,1,1,12,"Módulo de atención en cabecera"
```
8) `config_pesos.csv`
```
variable,peso
incidentes_buscadoras,0.30
...
```

## C. Metodología del Índice (editable en panel)
- Normalización min-max o Z-score por variable.
- Pesos ajustables (guardados en `config_pesos.csv`).
- Cálculo: 
```
indice = 100*(0.30*V1 + 0.20*V2 + 0.15*V3 + 0.15*V4 + 0.10*V5 + 0.10*(1 - cobertura_inst))
```
- Clasificación por quintiles y **semáforo de calidad de datos** (alto/medio/bajo).

## D. Flujo operativo (actualización mensual)
1) Subir CSV a la carpeta de Drive o editar Google Sheets.
2) Ejecutar **Acción de build** (o script local) → valida, resume y convierte a JSON/GeoJSON.
3) Revisar vista previa → **Publicar**.

## E. Seguridad y privacidad (Opción A)
- Solo **agregado municipal**; cero domicilios, rutas o coordenadas sensibles.
- Desfase y jitter en eventos públicos cuando proceda.
- Roles simples: público vs. institucional (password); auditoría de cambios en Git.

## F. Entregables Opción A
- Sitio del Atlas (mapa por capas + índice + fichas municipales descargables).
- Panel-básico (formularios simples/Sheets + importador CSV).
- Plantillas CSV, guía de actualización y **capacitación 2 h**.

## G. Ruta de migración a Opción B (sin rehacer nada)
- **Mantener contrato de API**: `GET /data/guanajuato/*.json` se conserva.
- Migrar fuentes a **Supabase/Postgres + PostGIS**; NocoDB como panel CRUD.
- ETL reconfigura orígenes (de Sheets/CSV → consultas SQL) pero **misma salida** GeoJSON.
- Activar **roles finos** (admin/editores/lectores), 2FA y bitácora a nivel registro.

## H. Cronograma sugerido (Opción A)
- **Día 1-2**: Setup repo, hosting, estilo y capas base (INEGI/CONEVAL/SESNSP).
- **Día 3-4**: Índice, fichas municipales, control de capas y modo institucional.
- **Día 5**: Conectar plantillas, pruebas, capacitación y entrega 1.0.

## I. Criterios de aceptación (MVP)
- Mapa carga < **3 s** en 4G; funciona en móvil.
- Combinar 3+ capas sin perder fluidez.
- Re-cálculo del índice al vuelo al cambiar pesos.
- Fichas descargables (PDF/PNG) con top 3 factores.
- Publicación desde CSV → sitio en ≤ 10 minutos.

## J. Extras opcionales (Opción A)
- **Botón de reporte de dato** (formulario Google) conectado al panel.
- **Traducción Zap/EN** parcial en fichas.
- **Modo oscuro**.

---

# Presupuesto y justificación
- **Paquete Opción A (MVP)**: **$24,900 MXN** (pago único). Incluye todo lo de la sección F.
- **Cargas puntuales adicionales** (si las requieren): $2,500 MXN por evento (opcional).

**Sustento de mercado (referencial 2024-2025):**
- Rangos habituales para **Data Analysts** en plataformas globales: **USD $20–$50/h**; en México se observan perfiles entre **$40–$50 USD/h** y perfiles locales en Workana alrededor de **$600 MXN/h**.
- Salarios nacionales para perfiles **GIS** equivalen a **$115–165 MXN/h** como empleado, con tasas freelance normalmente superiores.

> Nuestro precio corresponde a ~**30–40 h** efectivas con una tarifa blended **MXN $650–$800/h** (debajo del tope global), optimizando por reutilización de componentes y estático sin vendor lock-in.

---

# Próximos pasos
1) Me compartes **colores/logos** y nombres de campos definitivos.
2) Te entrego las **plantillas CSV** finales y activo el repo/hosting.
3) Integro las **primeras capas** (rezago, incidencia, RNPDNO agregada) y liberamos v1.0.

> Cualquier ajuste del diagnóstico final se refleja en los **pesos** del índice y/o capas sin rehacer el sistema.

