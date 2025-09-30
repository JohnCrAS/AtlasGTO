/**
 * Utilidades geoespaciales para el Atlas de Riesgo
 * 
 * Funciones para cargar y procesar datos GeoJSON,
 * especialmente las geometrías municipales de Guanajuato.
 */

import { GEO_CONFIG, GUANAJUATO_COLORS } from './atlasConfig';

/**
 * Gets the correct base path for assets based on the environment
 */
function getAssetBasePath(): string {
  // In production (GitHub Pages), we need to include the repository name
  if (process.env.NODE_ENV === 'production') {
    return '/AtlasGTO';
  }
  // In development, no base path needed
  return '';
}

/** Tipo para las propiedades de los municipios en el GeoJSON */
export interface MunicipalityProperties {
  id: null;                    // ID field (usually null)
  state_code: number;          // State code (11 for Guanajuato)
  mun_code: number;            // Municipality code (1-46)
  mun_name: string;            // Municipality name from GeoJSON
  // Computed fields (added by our processing)
  cvegeo?: string;             // Computed: "11" + mun_code padded (e.g. "11001")
  nombre?: string;             // Computed: official name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;          // Other properties that may exist
}

/** Tipo para una feature municipal */
export interface MunicipalityFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  properties: MunicipalityProperties;
}

/** Tipo para la colección de municipios */
export interface MunicipalitiesGeoJSON {
  type: 'FeatureCollection';
  features: MunicipalityFeature[];
}

/**
 * Carga el archivo GeoJSON de municipios de Guanajuato
 * 
 * GeoJSON ya está validado y es correcto según estándares INEGI.
 * No necesita normalización - solo agregar campo cvegeo para compatibilidad con datos.
 * 
 * @returns Promise con los datos GeoJSON de municipios
 */
export async function loadMunicipalitiesGeoJSON(): Promise<MunicipalitiesGeoJSON> {
  try {
    // Construct the full URL with the correct base path
    const basePath = getAssetBasePath();
    const fullUrl = `${basePath}${GEO_CONFIG.municipios.source}`;
    console.log(`🔗 Fetching GeoJSON from: ${fullUrl}`);
    
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      throw new Error(`Error cargando GeoJSON: ${response.status} ${response.statusText} for URL: ${fullUrl}`);
    }
    
    const geoJsonData = await response.json();
    
    // Solo agregar campo cvegeo para compatibilidad con datos JSON
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enhancedFeatures: MunicipalityFeature[] = geoJsonData.features.map((feature: any) => {
      const munCode = feature.properties.mun_code;
      const cvegeo = `11${munCode.toString().padStart(3, '0')}`;
      
      return {
        ...feature,
        properties: {
          ...feature.properties,
          cvegeo, // Agregar código compatible con datos JSON
          nombre: feature.properties.mun_name, // Usar nombre del GeoJSON (ya es correcto)
        }
      };
    });
    
    const enhancedGeoJson: MunicipalitiesGeoJSON = {
      type: 'FeatureCollection',
      features: enhancedFeatures,
    };
    
    console.log(`✅ GeoJSON cargado: ${enhancedGeoJson.features.length} municipios`);
    console.log(`📋 Códigos generados:`, enhancedFeatures.slice(0, 5).map(f => 
      `${f.properties.mun_name} (mun_code:${f.properties.mun_code} → cvegeo:${f.properties.cvegeo})`
    ), '...');
    
    return enhancedGeoJson;
  } catch (error) {
    console.error('❌ Error cargando municipios GeoJSON:', error);
    throw error;
  }
}

/**
 * Obtiene el estilo por defecto para las geometrías municipales
 * 
 * @returns Objeto de estilo compatible con Leaflet
 */
export function getDefaultMunicipalityStyle() {
  return {
    fillColor: GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL,
    fillOpacity: 0.1,
    color: GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL,
    weight: 1.5,
    opacity: 0.8,
  };
}

/**
 * Obtiene el estilo de hover para las geometrías municipales
 * 
 * @returns Objeto de estilo compatible con Leaflet
 */
export function getHoverMunicipalityStyle() {
  return {
    fillColor: GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL,
    fillOpacity: 0.3,
    color: GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL,
    weight: 2.5,
    opacity: 1,
  };
}

/**
 * Crea el contenido HTML para el popup de un municipio
 * 
 * @param properties - Propiedades del municipio
 * @returns HTML string para el popup
 */
export function createMunicipalityPopupContent(properties: MunicipalityProperties): string {
  const displayName = properties.nombre || properties.mun_name;
  const displayCode = properties.cvegeo || `${properties.state_code}${properties.mun_code.toString().padStart(3, '0')}`;
  
  return `
    <div style="font-family: system-ui; padding: 12px; min-width: 200px;">
      <h3 style="margin: 0 0 8px 0; color: ${GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL}; font-size: 18px; font-weight: 600;">
        ${displayName}
      </h3>
      <div style="font-size: 14px; color: #666; line-height: 1.4;">
        <p style="margin: 4px 0;">
          <strong>Código:</strong> ${displayCode}
        </p>
        <p style="margin: 4px 0;">
          <strong>Código GeoJSON:</strong> ${properties.mun_code}
        </p>
        <p style="margin: 4px 0;">
          <strong>Estado:</strong> Guanajuato (${properties.state_code})
        </p>
        <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #eee; font-size: 12px; color: ${GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL};">
          📍 Municipio de Guanajuato<br/>
          🗺️ Atlas de Riesgo para Mujeres Buscadoras
        </div>
      </div>
    </div>
  `;
}

/**
 * Busca un municipio por código geográfico
 * 
 * @param geoJsonData - Datos GeoJSON de municipios
 * @param cvegeo - Código geográfico a buscar
 * @returns Feature del municipio o undefined si no se encuentra
 */
export function findMunicipalityByCode(
  geoJsonData: MunicipalitiesGeoJSON, 
  cvegeo: string
): MunicipalityFeature | undefined {
  return geoJsonData.features.find(feature => 
    feature.properties.cvegeo === cvegeo
  );
}

/**
 * Obtiene una lista de todos los municipios ordenados por nombre
 * 
 * @param geoJsonData - Datos GeoJSON de municipios
 * @returns Array de propiedades de municipios ordenados
 */
export function getMunicipalitiesList(geoJsonData: MunicipalitiesGeoJSON): MunicipalityProperties[] {
  return geoJsonData.features
    .map(feature => feature.properties)
    .sort((a, b) => {
      const nameA = a.nombre || a.mun_name || '';
      const nameB = b.nombre || b.mun_name || '';
      return nameA.localeCompare(nameB, 'es');
    });
}

/**
 * Calcula los bounds (límites) de todos los municipios
 * 
 * @param geoJsonData - Datos GeoJSON de municipios
 * @returns Bounds en formato [[south, west], [north, east]]
 */
export function calculateMunicipalitiesBounds(geoJsonData: MunicipalitiesGeoJSON): [[number, number], [number, number]] {
  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;
  
  geoJsonData.features.forEach(feature => {
    const coords = feature.geometry.coordinates;
    
    // Función recursiva para procesar coordenadas anidadas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processCoords = (coordArray: any) => {
      if (typeof coordArray[0] === 'number') {
        // Es un punto [lng, lat]
        const [lng, lat] = coordArray;
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      } else {
        // Es un array de coordenadas
        coordArray.forEach(processCoords);
      }
    };
    
    processCoords(coords);
  });
  
  return [[minLat, minLng], [maxLat, maxLng]];
}
