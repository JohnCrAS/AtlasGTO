# Atlas de Riesgo para Mujeres Buscadoras - Plan Consolidado MVP

## 📋 Estado Actual del Proyecto

### ✅ Completado MVP - Fase 1 (Fundación)
- ✅ **Arquitectura base**: Next.js 15 + TypeScript + Tailwind v4
- ✅ **Configuración**: atlasConfig.ts con capas y fuentes de datos
- ✅ **Tema oficial**: Colores verificados con manual oficial de Guanajuato
- ✅ **Mapa base**: LeafletMap con OpenStreetMap funcionando
- ✅ **GeoJSON**: Carga y renderizado de municipios_gto.geojson
- ✅ **Tooltip municipal**: Info on hover/click con datos básicos
- ✅ **Geometrías municipales**: 46 municipios con estilos oficiales
- ✅ **Interactividad**: Hover effects, click to zoom, popups
- ✅ **Build system**: TypeScript compilation y Next.js build funcionando

### ✅ Completado MVP - Fase 2 (Validación y Datos)
- ✅ **Validación GeoJSON**: Sistema completo contra estándares INEGI oficiales
- ✅ **Integridad de datos**: GeoJSON verificado como 99.9% correcto (46/46 municipios)
- ✅ **Sistema de datos limpio**: Eliminada sobre-ingeniería, respeta estructura correcta del GeoJSON
- ✅ **Choropleth funcional**: Visualización de índice de riesgo con colores oficiales
- ✅ **Datos de ejemplo**: 6 archivos JSON en `/public/data/` integrados correctamente
- ✅ **Build system**: Compilación y validación TypeScript exitosa

### ✅ Completado MVP - Fase 3 (Capas Interactivas)
- ✅ **Sistema de gestión de capas**: LayerManager con estado reactivo y suscripciones
- ✅ **Toggle de capas**: Interfaz funcional para mostrar/ocultar 6 capas de datos
- ✅ **Sidebar desktop**: Panel lateral con controles de capas (320px) implementado
- ✅ **Hooks personalizados**: useLayerManager y useLayer para gestión de estado
- ✅ **Iconografía y colores**: Sistema visual coherente con tema oficial
- ✅ **Integración con mapa**: Capas se muestran/ocultan dinámicamente en Leaflet

### ✅ Completado MVP - Fase 4 (Múltiples Capas de Datos)
- ✅ **6 capas de datos**: Todas las capas implementadas y funcionales
- ✅ **Carga paralela**: Todos los datasets se cargan simultáneamente
- ✅ **2 visualizaciones choropleth**: Índice de Riesgo y Rezago Social funcionando
- ✅ **4 capas básicas**: Desapariciones, Homicidios, Tomas Clandestinas, Capacidad Instalada
- ✅ **Sistema escalable**: Arquitectura preparada para heat maps y markers
- ✅ **Gestión de estado**: Layer manager actualiza automáticamente con datos reales

### ✅ Completado MVP - Fase 6 (Datos Específicos por Capa + Refactoring)
- ✅ **Datos específicos por capa**: Cada capa muestra su propia información (casos, instituciones, etc.)
- ✅ **Popups layer-específicos**: Desapariciones muestra casos, Capacidad muestra instituciones
- ✅ **Colores apropiados**: Crime data = rojo, Safety data = verde, Risk index = escala oficial
- ✅ **Código refactorizado**: LeafletMap dividido en LayerFactory, PopupFactory, LayerConfigs
- ✅ **Arquitectura escalable**: Fácil agregar nuevos tipos de capas y visualizaciones
- ✅ **Debug mejorado**: Console logs detallados para troubleshooting

### 🔄 En Desarrollo - Fase 6 (Visualizaciones Avanzadas)
- 🔄 **Heat Maps**: Implementar mapas de calor para crimen (desapariciones, homicidios, tomas)
- 🔄 **Markers**: Visualización de puntos para capacidad instalada
- 🔄 **Leyenda dinámica**: Mostrar escalas de colores según la capa activa

### ❌ Pendiente Crítico para MVP
- ❌ **Componentes UI**: Sidebar, MapShell, FloatingActions, Legend, LayerGroup
- ❌ **Hooks**: useAtlasData, useChoropleth, useResponsivePanels  
- ❌ **Layout responsivo**: Desktop sidebar + mobile FABs
- ❌ **Accesibilidad**: Keyboard shortcuts (g=Capas, l=Leyenda)
- ❌ **Ficha municipal**: Componente y datos por municipio
- ❌ **Páginas adicionales**: /metodologia, /datos
- ❌ **Recálculo de índice**: Editor de pesos

---

## 🎯 Objetivo MVP (Entrega Inmediata)

**Mapa interactivo funcional** con:
1. ✅ **Mapa base funcional** con municipios de Guanajuato
2. ✅ **Geometrías municipales** con hover e interactividad
3. 🔄 **Coroplético del índice de riesgo** (0-100) por municipio
4. 🔄 **6 capas activables** con datos reales
5. 🔄 **Tooltip municipal** con top 3 factores
6. ❌ **Ficha municipal** descargable
7. ❌ **Páginas de metodología y datos**
8. ❌ **Editor de pesos** para recálculo en tiempo real

---

## 🏗️ Arquitectura Reorganizada

```
/app
  /page.tsx                    ❌ Landing + Mapa (implementado)
  /municipios/[cve]/page.tsx   ❌ Ficha municipal
  /metodologia/page.tsx        ❌ Metodología y pesos
  /datos/page.tsx              ❌ Diccionario y descargas

/components
  /ui                          # UI Components (no map logic)
    Button.tsx                 ❌ Botones base
    Card.tsx                   ❌ Tarjetas
    Drawer.tsx                 ❌ Cajones móviles
    Sheet.tsx                  ❌ Hojas modales
    Switch.tsx                 ❌ Interruptores
    Input.tsx                  ❌ Inputs
    Label.tsx                  ❌ Etiquetas
    Separator.tsx              ❌ Separadores
  
  /map                         # Map-specific components
    LeafletMap.tsx             ✅ Mapa base con GeoJSON (implementado)
    MapShell.tsx               ❌ Contenedor del mapa
    LayerControls.tsx          ❌ Controles de capas
    ChoroplethLayer.tsx        ❌ Capa coroplética
    HeatmapLayer.tsx           ❌ Capa de calor
    MarkerLayer.tsx            ❌ Capa de marcadores
    MapTooltip.tsx             ❌ Tooltips del mapa
    
  /panels                      # Panel components
    Sidebar.tsx                ❌ Panel lateral (mover aquí)
    Legend.tsx                 ❌ Leyenda (mover aquí)
    FloatingActions.tsx        ❌ FABs móviles (mover aquí)
    LayerGroup.tsx             ❌ Grupos de capas (mover aquí)
    WeightEditor.tsx           ❌ Editor de pesos
    
  /municipal                   # Municipal-specific components
    MunicipalitySheet.tsx      ❌ Ficha municipal
    MunicipalityCard.tsx       ❌ Tarjeta municipal
    TrendChart.tsx             ❌ Gráficas de tendencia

/lib
  atlasConfig.ts              ✅ Configuración (implementado)
  geoUtils.ts                 ✅ Utilidades geográficas (implementado)
  riskIndex.ts                ❌ Cálculo de índice
  join.ts                     ❌ Unión de datos
  mapUtils.ts                 ❌ Utilidades de mapa
  colorScales.ts              ❌ Escalas de color

/public
  /geo/municipios_gto.geojson ❌ Geometrías (existe)
  /data/*.json                ❌ Datos (6 archivos)
```

---

## 📊 Capas del Mapa (Visualizaciones Definidas)

| Capa | Archivo | Estado | Visualización | Componente |
|------|---------|--------|---------------|------------|
| **Índice de Riesgo** | `indice_riesgo.json` | ✅ | **Coroplético** (quintiles) | `ChoroplethLayer.tsx` |
| **Desapariciones** | `desapariciones_mun.json` | ✅ | **Heat Map** + Marcadores | `HeatmapLayer.tsx` + `MarkerLayer.tsx` |
| **Homicidios** | `homicidio_mun.json` | ✅ | **Heat Map** + Marcadores | `HeatmapLayer.tsx` + `MarkerLayer.tsx` |
| **Tomas Clandestinas** | `tomas_clandestinas.json` | ✅ | **Heat Map** (densidad/km²) | `HeatmapLayer.tsx` |
| **Rezago Social** | `rezago_municipal.json` | ✅ | **Coroplético** (quintiles) | `ChoroplethLayer.tsx` |
| **Capacidad Instalada** | `capacidad_instalada.json` | ✅ | **Marcadores** institucionales | `MarkerLayer.tsx` |

### 🗺️ Tipos de Visualización

#### 1. **Coroplético** (Choropleth)
- **Uso**: Índice de riesgo, rezago social
- **Método**: Colorear municipios por quintiles/valores
- **Componente**: `ChoroplethLayer.tsx`
- **Colores**: Escala de 5 colores (Guanajuato theme)

#### 2. **Heat Map** (Mapa de Calor) 
- **Uso**: Desapariciones, homicidios, tomas clandestinas
- **Método**: Densidad por área/población
- **Componente**: `HeatmapLayer.tsx` 
- **Plugin**: `leaflet.heat` o canvas personalizado

#### 3. **Marcadores** (Markers)
- **Uso**: Capacidad instalada, eventos puntuales
- **Método**: Iconos SVG personalizados por tipo
- **Componente**: `MarkerLayer.tsx`
- **Clustering**: Para alta densidad de puntos

---

## 🧮 Metodología del Índice de Riesgo

### Variables y Pesos (Editables)
```javascript
const PESOS_DEFAULT = {
  V1_incidentes_buscadoras: 0.30,  // Incidentes contra buscadoras
  V2_desapariciones: 0.20,         // Tasa de desapariciones/100k
  V3_homicidio: 0.15,              // Tasa de homicidio doloso
  V4_huachicol: 0.15,              // Tomas clandestinas/km²
  V5_rezago: 0.10,                 // Índice de rezago social
  V6_capacidad_inversa: 0.10       // (1 - cobertura institucional)
};
```

### Fórmula de Cálculo
```
Índice = 100 * (0.30*V1 + 0.20*V2 + 0.15*V3 + 0.15*V4 + 0.10*V5 + 0.10*V6)
```

### Clasificación por Quintiles
- **Muy Alto**: 80-100 (rojo #F45197)
- **Alto**: 60-79 (naranja #FF8200)  
- **Medio**: 40-59 (amarillo #32AA00)
- **Bajo**: 20-39 (azul #00A99D)
- **Muy Bajo**: 0-19 (verde #0066FF)

---

## 🎨 Tema Visual (sg.guanajuato.gob.mx)

### Paleta de Colores
```css
:root {
  --gto-blue: #6580A4;      /* Azul institucional */
  --gto-blue-deep: #0066FF; /* Azul profundo */
  --gto-teal: #00A99D;      /* Verde azulado */
  --gto-orange: #FF8200;    /* Naranja */
  --gto-green: #32AA00;     /* Verde */
  --gto-pink: #F45197;      /* Rosa */
  --gto-light: #B9C8E7;     /* Azul claro */
}
```

### Accesibilidad WCAG AA
- Contraste mínimo 4.5:1
- Targets táctiles ≥44px
- Navegación por teclado
- Screen reader support

---

## 📱 Layout Responsivo

### Desktop (≥1024px)
- **Sidebar izquierdo**: 320px, colapsable
- **Mapa principal**: Resto del espacio
- **Leyenda**: Floating bottom-right

### Mobile (<768px)  
- **Sidebar**: Oculto por defecto
- **FABs**: "Capas" y "Periodo/Ajustes"
- **Gestos**: Swipe-left para abrir, ESC/tap-out para cerrar

### Shortcuts
- `g` = Toggle Capas
- `l` = Toggle Leyenda  
- `p` = Periodo/Ajustes (futuro)

---

## 🚀 Plan de Implementación (5 Días)

*Fill in*

---

## 📋 Criterios de Aceptación MVP

### Funcionalidad Core
- [ ] Mapa carga <3s en 4G, funciona en móvil
- [ ] Coroplético del índice de riesgo visible
- [ ] 6 capas activables con toggle funcional
- [ ] Tooltip muestra: municipio, índice, top 3 factores
- [ ] Ficha municipal con datos y tendencias
- [ ] Editor de pesos recalcula índice al vuelo

### Performance y Accesibilidad  
- [ ] Lighthouse Performance ≥90
- [ ] Lighthouse Accessibility ≥90
- [ ] Zero console errors/warnings
- [ ] Navegación por teclado completa
- [ ] Screen reader compatible

### Contenido
- [ ] Página `/metodologia` con explicación clara
- [ ] Página `/datos` con diccionario y descargas
- [ ] Textos en español, incluyente y claro
- [ ] Disclaimer sobre limitaciones de datos

---

## 🔒 Privacidad y Seguridad

### Reglas Estrictas
- ✅ **Solo agregación municipal** - Cero domicilios o coordenadas sensibles
- ✅ **Datos públicos** - Todo en `/public/data/`
- ✅ **Sin backend** - Aplicación estática
- ✅ **Fuentes documentadas** - Metadatos en cada archivo JSON

### Datos Permitidos
- ✅ Conteos municipales agregados
- ✅ Tasas por 100,000 habitantes  
- ✅ Índices y quintiles
- ✅ Presencia/ausencia institucional

---

## 🛠️ Stack Tecnológico Confirmado

### Frontend
- **Next.js 15** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS v4+**
- **shadcn/ui** (componentes base)
- **Lucide Icons** (For icons)

### Mapas y Visualización
- **Leaflet 1.9+** (core mapping)
- **react-leaflet 5.0+** (React integration)
- **leaflet.heat** (heat map plugin)
- **leaflet.markercluster** (marker clustering)

### Tiles y Basemap
- **OpenStreetMap** (default, sin API key)
  - Tiles: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
  - Attribution: `© OpenStreetMap contributors`
- **Alternativas** (configurables):
  - **CartoDB Positron**: Estilo limpio para datos
  - **ESRI World Imagery**: Satelital cuando sea necesario
  - **MapTiler** (con token): Estilos personalizados

### Datos
- **JSON estático** en `/public/data/`
- **GeoJSON** para geometrías municipales
- **Sin base de datos** (MVP)
- **CSV import** para actualizaciones

### Hosting
- **Vercel/Netlify** (aplicación estática)
- **CDN automático** para assets y tiles
- **Dominio personalizado** (futuro)

---

## 📈 Roadmap Post-MVP

### Fase 2: Administración (Semanas 3-4)
- Panel de administración con NocoDB
- Importador CSV/Excel
- Usuarios y roles con 2FA
- Historial de cambios

### Fase 3: Datos Avanzados (Mes 2)
- Integración con fuentes oficiales (SESNSP, RNPDNO)
- ETL automatizado
- Alertas y notificaciones
- API pública para datos abiertos

### Fase 4: Inteligencia (Mes 3)
- Predicciones y tendencias
- Alertas tempranas
- Recomendaciones automáticas
- Dashboard ejecutivo

---

## 🎯 Próximos Pasos Inmediatos

### ✅ Fase 1 Completada (Fundación) - 24 Sep 2024
- ✅ Arquitectura Next.js 15 + TypeScript + Tailwind v4
- ✅ Tema oficial verificado con manual de Guanajuato
- ✅ Mapa Leaflet funcional con OpenStreetMap
- ✅ GeoJSON de municipios cargando correctamente
- ✅ 46 municipios con hover effects y popups
- ✅ Build system funcionando sin errores

### 🔄 Fase 2 En Curso (Datos y Visualización)
1. **Cargar datos JSON** - Implementar carga de los 6 archivos de datos
2. **Capa choropleth** - Visualizar índice de riesgo por municipio
3. **Join de datos** - Unir datos JSON con geometrías GeoJSON
4. **Colores por quintiles** - Aplicar escala de colores oficial

### 📋 Fase 3 Planificada (UI y Controles)
1. **Sidebar de capas** - Panel lateral con toggles de visualización
2. **Leyenda flotante** - Explicación de colores y escalas
3. **Controles responsivos** - FABs para móvil
4. **Tooltips avanzados** - Top 3 factores de riesgo por municipio

### 🎯 Meta Inmediata
**Mostrar el índice de riesgo como choropleth** - Próximo paso crítico para demostrar valor del atlas.

---

## ✅ Definition of Done

Un MVP está **COMPLETO** cuando:

1. **El mapa funciona** sin errores en desktop y móvil
2. **Las 6 capas se activan/desactivan** correctamente  
3. **El índice de riesgo se visualiza** con coroplético por quintiles
4. **Los tooltips muestran datos** relevantes del municipio
5. **Las fichas municipales** se abren y tienen contenido real
6. **El editor de pesos** recalcula el índice al cambiar valores
7. **Las páginas `/metodologia` y `/datos`** existen y están completas
8. **Lighthouse ≥90** en Performance y Accessibility
9. **Zero warnings** en consola y ESLint
10. **Funciona offline** una vez cargado (PWA básico)

---
