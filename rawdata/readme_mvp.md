# Atlas de Riesgo para Mujeres Buscadoras en Guanajuato — MVP (Build Brief)

## 1) Propósito y alcance
MVP público con mapa interactivo y **índice de riesgo (0–100) por municipio**, capas activables y fichas municipales descargables. Admin simple (importar CSV/JSON y recalcular índice). Basado en diagnóstico/entornos y capas definidas previamente.

## 2) Arquitectura (contrato estable)
- **Frontend**: Next.js (App Router, TypeScript), Tailwind v4, Leaflet + teselas OpenStreetMap.
- **Datos públicos**: `/public/data/*.json`, `/public/geo/municipios_gto.geojson`.
- **Sin backend** (MVP): datos estáticos; botón “Recalcular” simulado vía función local.
- **Ruta a futuro**: luego se podrá montar Supabase/PostGIS sin romper este contrato.

## 3) Estructura de carpetas
```
/app
  /page.tsx                  -> Landing + Mapa
  /municipios/[cve]/page.tsx -> Ficha municipal (modal o page)
  /metodologia/page.tsx      -> Metodología y pesos
  /datos/page.tsx            -> Diccionario y descargas
/components
  Map.tsx, LayerControls.tsx, Legend.tsx, TooltipCard.tsx, TrendChart.tsx
/lib
  dataClient.ts              -> loaders JSON
  riskIndex.ts               -> normalización + cálculo índice
/public/geo/municipios_gto.geojson
/public/data/*.json
```

## 4) Capas del mapa (todas por municipio, activables)
- `colectivos_municipio.json` (agregado, sin domicilios).
- `incidentes_buscadoras.json` (conteos/sí-no por año).
- `desapariciones_mun_mensual.json` (casos por mes).
- `homicidio_mun_mensual.json` (casos y tasa_100k por mes).
- `tomas_clandestinas_mun.json` (huachicol; normalizar por km²).
- `rezago_municipal.json` (IRS/quintil).
- `capacidad_instalada.json` (presencia institucional).
- `config_pesos.json` (V1..V6).

## 5) Índice de riesgo (editable)
Variables normalizadas [0–1] y pesos por defecto:  
V1 incidentes buscadoras 0.30; V2 desapariciones 0.20; V3 homicidio 0.15; V4 huachicol 0.15; V5 rezago 0.10; V6 capacidad inversa 0.10.  
`Indice = 100 * (0.30*V1 + 0.20*V2 + 0.15*V3 + 0.15*V4 + 0.10*V5 + 0.10*(1 - cobertura_inst))`  
Clasificación por quintiles; semáforo de **calidad del dato** (alto/medio/bajo).

## 6) UI/UX mínimo
- Controles: checklist de capas, selector de año/mes, ver leyenda, ver metodología.  
- Tooltip municipal: índice, top 3 contribuciones, tendencia 12 meses, botón “Ver ficha”.  
- Ficha municipal: series (desaparición/homicidio), oferta institucional, recomendaciones, descargar PDF (stub).  
- Mobile-first; accesible; lenguaje incluyente.

## 7) Datos de ejemplo (colocar en `/public/data/`)
`colectivos_municipio.json`
```json
[
  {"municipio":"León","anio":2025,"num_colectivos":4,"num_independientes":7,"observaciones":"Cobertura urbana"},
  {"municipio":"Celaya","anio":2025,"num_colectivos":3,"num_independientes":4,"observaciones":"Cobertura regional"}
]
```
`homicidio_mun_mensual.json`
```json
[
  {"municipio":"León","anio":2025,"mes":7,"casos":276,"tasa_100k":34.33},
  {"municipio":"Celaya","anio":2025,"mes":7,"casos":177,"tasa_100k":77.96}
]
```
`tomas_clandestinas_mun.json`
```json
[
  {"municipio":"Salamanca","anio":2025,"mes":6,"tomas":15,"superficie_km2":759.1},
  {"municipio":"Villagrán","anio":2025,"mes":6,"tomas":9,"superficie_km2":291.5}
]
```
`rezago_municipal.json`
```json
[
  {"municipio":"Pénjamo","irs_2020":-0.45,"quintil":3},
  {"municipio":"León","irs_2020":-0.12,"quintil":2}
]
```
`capacidad_instalada.json`
```json
[
  {"municipio":"Irapuato","comision_busqueda":1,"imm_imug":1,"fiscalia":1,"c5i":1,"centros_salud":12},
  {"municipio":"Salvatierra","comision_busqueda":1,"imm_imug":1,"fiscalia":1,"c5i":0,"centros_salud":5}
]
```
`config_pesos.json`
```json
[
  {"variable":"V1_incidentes","peso":0.30},
  {"variable":"V2_desaparicion","peso":0.20},
  {"variable":"V3_homicidio","peso":0.15},
  {"variable":"V4_huachicol","peso":0.15},
  {"variable":"V5_rezago","peso":0.10},
  {"variable":"V6_capacidad_inversa","peso":0.10}
]
```

## 8) Reglas de privacidad y estilo
- Solo agregación municipal; **no** domicilios, rutas, ni coordenadas sensibles.
- Texto en español, incluyente, claro y consistente.

## 9) Tareas del implementador
1. Cargar `municipios_gto.geojson` y las JSON de ejemplo.  
2. Renderizar Leaflet con coroplético del índice y toggles de capas.  
3. Implementar `riskIndex.ts` (normalizar min-max y combinar según pesos).  
4. Construir Ficha municipal y páginas de Metodología/Datos.  
5. Proveer scripts npm: `dev`, `build`, `start`, `lint`.

## 10) Aceptación (MVP)
- El mapa carga sin errores; controles de capas funcionan.  
- Índice se recalcula al cambiar pesos (slider o inputs).  
- Tooltip y ficha muestran datos de ejemplo coherentes.  
- `/metodologia` y `/datos` existen con contenidos mínimos y diccionario de datos.  
- No se exponen datos sensibles.

## 11) Datos reales (posterior)
Fuentes típicas: SESNSP (incidencia municipal), RNPDNO (desapariciones), CONEVAL (rezago), INEGI (marco geoestadístico), PEMEX/SENER (ductos/tomas). Exportar a las plantillas de `/public/data/` sin romper esquemas.

## 12) Quickstart (para devs)
```bash
# Crear proyecto
pnpm dlx create-next-app@latest atlas-mujeres --ts --app --eslint --tailwind
# Instalar Leaflet y typings
pnpm add leaflet react-leaflet
pnpm add -D @types/leaflet
# Ejecutar
pnpm dev
```

