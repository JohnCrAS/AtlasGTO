/**
 * Atlas de Riesgo para Mujeres Buscadoras - Configuración Principal
 * 
 * Define las capas del mapa, fuentes de datos, escalas de color
 * y configuración general del atlas según el plan MVP.
 */

// ============================================================================
// TEMA VISUAL OFICIAL - Gobierno del Estado de Guanajuato
// ============================================================================

/** Colores oficiales del Gobierno de Guanajuato */
export const GUANAJUATO_COLORS = {
  // Colores por Eje de Gobierno
  SEGURIDAD_PAZ_SOCIAL: '#6580A4',     // Azul institucional - nuestro color principal
  DESARROLLO_SOCIAL: '#F45197',         // Rosa - desarrollo social y humano
  DESARROLLO_ECONOMICO: '#FF8200',      // Naranja - desarrollo económico
  STAFF_GOBERNADOR: '#0066FF',          // Azul profundo - staff del gobernador
  GOBIERNO_EFECTIVO: '#00A99D',         // Verde azulado - gobierno efectivo
  EDUCACION_CALIDAD: '#B9C8E7',         // Azul claro - educación
  DESARROLLO_SOSTENIBLE: '#32AA00',     // Verde - desarrollo sostenible
  
  // Colores base oficiales
  AZUL_MARINO: '#000F9F',               // Azul marino oficial
  AZUL_MEDIO: '#0066FF',                // Azul medio oficial
  DOCUMENTOS: '#c8c8aa',                // Color para documentos oficiales
} as const;

// ============================================================================
// ESCALAS DE COLOR PARA VISUALIZACIONES
// ============================================================================

/** Escala de colores para índice de riesgo (quintiles) - Tonos de azul */
export const RISK_INDEX_COLORS = {
  MUY_ALTO: '#003366',    // Azul muy oscuro (80-100) - Riesgo muy alto
  ALTO: '#004d99',        // Azul oscuro (60-79) - Riesgo alto  
  MEDIO: '#0066cc',       // Azul medio (40-59) - Riesgo medio
  BAJO: '#3399ff',        // Azul claro (20-39) - Riesgo bajo
  MUY_BAJO: '#99ccff',    // Azul muy claro (0-19) - Riesgo muy bajo
} as const;

/** Rangos de quintiles para clasificación de riesgo */
export const RISK_INDEX_RANGES = {
  MUY_ALTO: { min: 80, max: 100, label: 'Muy Alto', color: RISK_INDEX_COLORS.MUY_ALTO },
  ALTO: { min: 60, max: 79, label: 'Alto', color: RISK_INDEX_COLORS.ALTO },
  MEDIO: { min: 40, max: 59, label: 'Medio', color: RISK_INDEX_COLORS.MEDIO },
  BAJO: { min: 20, max: 39, label: 'Bajo', color: RISK_INDEX_COLORS.BAJO },
  MUY_BAJO: { min: 0, max: 19, label: 'Muy Bajo', color: RISK_INDEX_COLORS.MUY_BAJO },
} as const;

// ============================================================================
// METODOLOGÍA DEL ÍNDICE DE RIESGO
// ============================================================================

/** Pesos por defecto para el cálculo del índice de riesgo (editables por usuario) */
export const DEFAULT_RISK_WEIGHTS = {
  V1_incidentes_buscadoras: 0.30,    // Incidentes contra buscadoras
  V2_desapariciones: 0.20,           // Tasa de desapariciones/100k hab
  V3_homicidio: 0.15,                // Tasa de homicidio doloso
  V4_huachicol: 0.15,                // Tomas clandestinas/km²
  V5_rezago: 0.10,                   // Índice de rezago social
  V6_capacidad_inversa: 0.10,        // (1 - cobertura institucional)
} as const;

/** Metadatos de las variables del índice de riesgo */
export const RISK_VARIABLES_METADATA = {
  V1_incidentes_buscadoras: {
    name: 'Incidentes contra Buscadoras',
    description: 'Número de incidentes reportados contra mujeres buscadoras',
    unit: 'eventos',
    source: 'Secretaría de Seguridad Pública',
    weight: DEFAULT_RISK_WEIGHTS.V1_incidentes_buscadoras,
  },
  V2_desapariciones: {
    name: 'Desapariciones',
    description: 'Tasa de desapariciones por 100,000 habitantes',
    unit: 'por 100k hab',
    source: 'Registro Nacional de Personas Desaparecidas',
    weight: DEFAULT_RISK_WEIGHTS.V2_desapariciones,
  },
  V3_homicidio: {
    name: 'Homicidio Doloso',
    description: 'Tasa de homicidio doloso por 100,000 habitantes',
    unit: 'por 100k hab',
    source: 'Secretariado Ejecutivo del SNSP',
    weight: DEFAULT_RISK_WEIGHTS.V3_homicidio,
  },
  V4_huachicol: {
    name: 'Tomas Clandestinas',
    description: 'Densidad de tomas clandestinas por km²',
    unit: 'por km²',
    source: 'PEMEX / Secretaría de Seguridad',
    weight: DEFAULT_RISK_WEIGHTS.V4_huachicol,
  },
  V5_rezago: {
    name: 'Rezago Social',
    description: 'Índice de rezago social municipal',
    unit: 'índice',
    source: 'CONEVAL',
    weight: DEFAULT_RISK_WEIGHTS.V5_rezago,
  },
  V6_capacidad_inversa: {
    name: 'Capacidad Institucional',
    description: 'Inverso de la cobertura institucional disponible',
    unit: 'índice',
    source: 'Secretaría de Desarrollo Social',
    weight: DEFAULT_RISK_WEIGHTS.V6_capacidad_inversa,
  },
} as const;

// ============================================================================
// DEFINICIÓN DE CAPAS DEL MAPA
// ============================================================================

/** Tipos de visualización disponibles */
export type LayerVisualizationType = 'choropleth' | 'heatmap' | 'markers' | 'hybrid';

/** Configuración de una capa del atlas */
export interface AtlasLayerConfig {
  id: string;
  name: string;
  description: string;
  dataSource: string;
  visualization: LayerVisualizationType;
  color: string;
  isActive: boolean;
  group: string;
  order: number;
  metadata: {
    source: string;
    lastUpdated: string;
    unit: string;
    methodology?: string;
  };
}

/** Configuración de todas las capas del atlas */
export const ATLAS_LAYERS: Record<string, AtlasLayerConfig> = {
  // ====== CAPA PRINCIPAL: ÍNDICE DE RIESGO ======
  indice_riesgo: {
    id: 'indice_riesgo',
    name: 'Índice de Riesgo',
    description: 'Índice compuesto de riesgo para mujeres buscadoras por municipio (0-100)',
    dataSource: '/data/indice_riesgo.json',
    visualization: 'choropleth',
    color: GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL,
    isActive: true, // Activa por defecto
    group: 'principal',
    order: 1,
    metadata: {
      source: 'Gobierno del Estado de Guanajuato',
      lastUpdated: '2024-01',
      unit: 'índice 0-100',
      methodology: 'Promedio ponderado de 6 variables de riesgo',
    },
  },

  // ====== CAPAS DE FACTORES DE RIESGO ======
  desapariciones: {
    id: 'desapariciones',
    name: 'Desapariciones',
    description: 'Casos de desaparición por municipio con visualización de densidad',
    dataSource: '/data/desapariciones_mun.json',
    visualization: 'hybrid', // Heatmap + markers
    color: GUANAJUATO_COLORS.DESARROLLO_SOCIAL,
    isActive: false,
    group: 'factores_riesgo',
    order: 2,
    metadata: {
      source: 'Registro Nacional de Personas Desaparecidas (RNPDNO)',
      lastUpdated: '2024-01',
      unit: 'casos',
    },
  },

  homicidios: {
    id: 'homicidios',
    name: 'Homicidios',
    description: 'Homicidios dolosos por municipio con mapa de calor',
    dataSource: '/data/homicidio_mun.json',
    visualization: 'hybrid', // Heatmap + markers
    color: GUANAJUATO_COLORS.DESARROLLO_ECONOMICO,
    isActive: false,
    group: 'factores_riesgo',
    order: 3,
    metadata: {
      source: 'Secretariado Ejecutivo del SNSP',
      lastUpdated: '2024-01',
      unit: 'casos',
    },
  },

  tomas_clandestinas: {
    id: 'tomas_clandestinas',
    name: 'Tomas Clandestinas',
    description: 'Densidad de tomas clandestinas de combustible por municipio',
    dataSource: '/data/tomas_clandestinas.json',
    visualization: 'heatmap',
    color: GUANAJUATO_COLORS.DESARROLLO_ECONOMICO,
    isActive: false,
    group: 'factores_riesgo',
    order: 4,
    metadata: {
      source: 'PEMEX / Secretaría de Seguridad Pública',
      lastUpdated: '2024-01',
      unit: 'por km²',
    },
  },

  // ====== CAPAS SOCIOECONÓMICAS ======
  rezago_social: {
    id: 'rezago_social',
    name: 'Rezago Social',
    description: 'Índice de rezago social municipal por quintiles',
    dataSource: '/data/rezago_municipal.json',
    visualization: 'choropleth',
    color: GUANAJUATO_COLORS.DESARROLLO_SOSTENIBLE,
    isActive: false,
    group: 'socioeconomico',
    order: 5,
    metadata: {
      source: 'CONEVAL',
      lastUpdated: '2020',
      unit: 'quintiles',
    },
  },

  // ====== CAPAS INSTITUCIONALES ======
  capacidad_instalada: {
    id: 'capacidad_instalada',
    name: 'Capacidad Institucional',
    description: 'Infraestructura institucional disponible para búsqueda',
    dataSource: '/data/capacidad_instalada.json',
    visualization: 'markers',
    color: GUANAJUATO_COLORS.GOBIERNO_EFECTIVO,
    isActive: false,
    group: 'institucional',
    order: 6,
    metadata: {
      source: 'Secretaría de Desarrollo Social',
      lastUpdated: '2024-01',
      unit: 'instituciones',
    },
  },
} as const;

// ============================================================================
// CONFIGURACIÓN DEL MAPA BASE
// ============================================================================

/** Configuración del mapa base Leaflet */
export const MAP_CONFIG = {
  // Centro inicial en Guanajuato
  center: [21.0190, -101.2574] as [number, number],
  zoom: 8,
  minZoom: 7,
  maxZoom: 12,
  
  // Límites del mapa (bbox de Guanajuato)
  bounds: [
    [19.8, -102.2],   // Southwest
    [22.2, -99.5]     // Northeast
  ] as [[number, number], [number, number]],
  
  // Configuración de tiles
  tileLayer: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
  },
  
  // Estilo del mapa
  style: {
    backgroundColor: '#f8f9fa',
    borderColor: GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL,
  },
} as const;

// ============================================================================
// CONFIGURACIÓN DE DATOS GEO
// ============================================================================

/** Configuración de archivos geoespaciales */
export const GEO_CONFIG = {
  municipios: {
    source: '/geo/municipios_gto.geojson',
    idField: 'CVE_MUN',      // Campo clave en GeoJSON
    nameField: 'NOMGEO',     // Campo nombre en GeoJSON
  },
} as const;

// ============================================================================
// EXPORTACIONES PARA USO EN COMPONENTES
// ============================================================================

/** Grupos de capas para organizar la sidebar */
export const LAYER_GROUPS = {
  principal: {
    name: 'Índice Principal',
    description: 'Índice compuesto de riesgo',
    color: GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL,
  },
  factores_riesgo: {
    name: 'Factores de Riesgo',
    description: 'Variables que componen el índice',
    color: GUANAJUATO_COLORS.DESARROLLO_SOCIAL,
  },
  socioeconomico: {
    name: 'Contexto Socioeconómico',
    description: 'Indicadores socioeconómicos',
    color: GUANAJUATO_COLORS.DESARROLLO_SOSTENIBLE,
  },
  institucional: {
    name: 'Capacidad Institucional',
    description: 'Recursos disponibles para búsqueda',
    color: GUANAJUATO_COLORS.GOBIERNO_EFECTIVO,
  },
} as const;

/** Obtener capas por grupo */
export function getLayersByGroup(groupId: string): AtlasLayerConfig[] {
  return Object.values(ATLAS_LAYERS)
    .filter(layer => layer.group === groupId)
    .sort((a, b) => a.order - b.order);
}

/** Obtener configuración de una capa por ID */
export function getLayerConfig(layerId: string): AtlasLayerConfig | undefined {
  return ATLAS_LAYERS[layerId];
}

/** Obtener todas las capas activas */
export function getActiveLayers(): AtlasLayerConfig[] {
  return Object.values(ATLAS_LAYERS)
    .filter(layer => layer.isActive)
    .sort((a, b) => a.order - b.order);
}
