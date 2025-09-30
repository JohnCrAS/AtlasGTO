/**
 * Data Loading System - Atlas de Riesgo
 * 
 * Scalable system to load and process JSON data files.
 * Designed to easily swap dummy data for real municipal data later.
 * 
 * Key Design Principles:
 * - Easy to add new data sources
 * - Consistent data structure across all layers
 * - Handles missing data gracefully
 * - Caching for performance
 * - Type-safe with proper error handling
 */

import { ATLAS_LAYERS } from './atlasConfig';

/**
 * Gets the correct base path for data files based on the environment
 */
function getDataBasePath(): string {
  // In production (GitHub Pages), we need to include the repository name
  if (process.env.NODE_ENV === 'production') {
    return '/AtlasGTO';
  }
  // In development, no base path needed
  return '';
}

/** Base interface for all municipal data records */
export interface MunicipalDataRecord {
  municipio: string;        // Código del municipio (ej: "11001")
  [key: string]: unknown;   // Datos específicos del layer
}

/** Interface for data files with metadata */
export interface DataFile<T extends MunicipalDataRecord = MunicipalDataRecord> {
  version: string;
  source?: string;
  updated?: string;
  metadata?: Record<string, unknown>;
  records: T[];
}

/** Risk index specific data structure */
export interface RiskIndexRecord extends MunicipalDataRecord {
  indice: number;
  top_factores: string[];
  calidad: 'alta' | 'media' | 'baja';
}

/** Disappearances data structure */
export interface DisappearancesRecord extends MunicipalDataRecord {
  total_casos: number;
  tasa_por_100k: number;
  tendencia: 'subiendo' | 'estable' | 'bajando';
}

/** Generic layer data cache */
const dataCache = new Map<string, DataFile>();

/**
 * Loads a JSON data file for a specific layer
 * 
 * @param layerId - ID of the layer to load data for
 * @returns Promise with the loaded data file
 */
export async function loadLayerData<T extends MunicipalDataRecord = MunicipalDataRecord>(
  layerId: string
): Promise<DataFile<T>> {
  // Check cache first
  if (dataCache.has(layerId)) {
    return dataCache.get(layerId) as DataFile<T>;
  }

  const layerConfig = ATLAS_LAYERS[layerId];
  if (!layerConfig) {
    throw new Error(`Layer not found: ${layerId}`);
  }

  try {
    console.log(`📊 Loading data for layer: ${layerConfig.name}`);
    
    // Construct the full URL with the correct base path
    const basePath = getDataBasePath();
    const fullUrl = `${basePath}${layerConfig.dataSource}`;
    console.log(`🔗 Fetching data from: ${fullUrl}`);
    
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText} for URL: ${fullUrl}`);
    }

    const rawData = await response.json();
    
    // Validate data structure
    if (!rawData.records || !Array.isArray(rawData.records)) {
      throw new Error(`Invalid data structure in ${layerConfig.dataSource}: missing 'records' array`);
    }

    // Create a proper DataFile structure with version if missing
    const dataFile: DataFile<T> = {
      version: rawData.version || '2024.1',
      source: rawData.source,
      updated: rawData.updated,
      metadata: rawData.metadata,
      records: rawData.records
    };

    // Cache the data
    dataCache.set(layerId, dataFile);
    
    console.log(`✅ Loaded ${dataFile.records.length} records for ${layerConfig.name}`);
    return dataFile;

  } catch (error) {
    console.error(`❌ Error loading ${layerConfig.name}:`, error);
    throw error;
  }
}

/**
 * Loads multiple layer data files in parallel
 * 
 * @param layerIds - Array of layer IDs to load
 * @returns Promise with map of loaded data files
 */
export async function loadMultipleLayerData(
  layerIds: string[]
): Promise<Map<string, DataFile>> {
  console.log(`📊 Loading ${layerIds.length} layers in parallel:`, layerIds);
  
  const loadPromises = layerIds.map(async (layerId) => {
    try {
      console.log(`🔄 Starting to load: ${layerId}`);
      const data = await loadLayerData(layerId);
      console.log(`✅ Successfully loaded ${layerId}: ${data.records.length} records`);
      return [layerId, data] as const;
    } catch (error) {
      console.error(`❌ Failed to load layer ${layerId}:`, error);
      return null;
    }
  });

  const results = await Promise.all(loadPromises);
  const dataMap = new Map<string, DataFile>();

  let successful = 0;
  let failed = 0;

  results.forEach(result => {
    if (result) {
      const [layerId, data] = result;
      dataMap.set(layerId, data);
      successful++;
    } else {
      failed++;
    }
  });

  console.log(`📊 Data loading summary: ${successful} successful, ${failed} failed`);
  console.log(`📋 Successfully loaded layers:`, Array.from(dataMap.keys()));

  return dataMap;
}

/**
 * Gets data for a specific municipality from a layer
 * 
 * @param layerId - Layer ID
 * @param municipioCode - Municipality code (ej: "11001")
 * @returns Municipal data record or undefined if not found
 */
export async function getMunicipalityData<T extends MunicipalDataRecord = MunicipalDataRecord>(
  layerId: string,
  municipioCode: string
): Promise<T | undefined> {
  try {
    const dataFile = await loadLayerData<T>(layerId);
    return dataFile.records.find(record => record.municipio === municipioCode);
  } catch (error) {
    console.warn(`Failed to get municipality data for ${municipioCode} in ${layerId}:`, error);
    return undefined;
  }
}

/**
 * Creates a lookup map for fast municipality data access
 * 
 * @param dataFile - Data file to create lookup from
 * @returns Map with municipality code as key and data as value
 */
export function createMunicipalityLookup<T extends MunicipalDataRecord>(
  dataFile: DataFile<T>
): Map<string, T> {
  const lookup = new Map<string, T>();
  
  dataFile.records.forEach(record => {
    lookup.set(record.municipio, record);
  });

  return lookup;
}

/**
 * Validates that municipality codes match between GeoJSON and data files
 * 
 * @param geoMunicipalityCodes - Set of codes from GeoJSON
 * @param dataMunicipalityCodes - Set of codes from data file
 * @returns Object with matching and missing codes
 */
export function validateMunicipalityAlignment(
  geoMunicipalityCodes: Set<string>,
  dataMunicipalityCodes: Set<string>
) {
  const matching = new Set<string>();
  const missingInGeo = new Set<string>();
  const missingInData = new Set<string>();

  // Check what's in data but missing in geo
  dataMunicipalityCodes.forEach(code => {
    if (geoMunicipalityCodes.has(code)) {
      matching.add(code);
    } else {
      missingInGeo.add(code);
    }
  });

  // Check what's in geo but missing in data
  geoMunicipalityCodes.forEach(code => {
    if (!dataMunicipalityCodes.has(code)) {
      missingInData.add(code);
    }
  });

  return {
    matching: Array.from(matching),
    missingInGeo: Array.from(missingInGeo),
    missingInData: Array.from(missingInData),
    alignmentRatio: matching.size / Math.max(geoMunicipalityCodes.size, dataMunicipalityCodes.size)
  };
}

/**
 * Clears the data cache (useful for development/testing)
 */
export function clearDataCache(): void {
  dataCache.clear();
  console.log('🗑️ Data cache cleared');
}

/**
 * Gets cache status for debugging
 */
export function getCacheStatus(): { layerId: string; recordCount: number }[] {
  return Array.from(dataCache.entries()).map(([layerId, data]) => ({
    layerId,
    recordCount: data.records.length
  }));
}

// ============================================================================
// CONVENIENCE FUNCTIONS FOR SPECIFIC LAYERS
// ============================================================================

/**
 * Loads the risk index data specifically
 */
export async function loadRiskIndexData(): Promise<DataFile<RiskIndexRecord>> {
  return loadLayerData<RiskIndexRecord>('indice_riesgo');
}

/**
 * Loads disappearances data specifically  
 */
export async function loadDisappearancesData(): Promise<DataFile<DisappearancesRecord>> {
  return loadLayerData<DisappearancesRecord>('desapariciones');
}

/**
 * Loads homicides data specifically
 */
export async function loadHomicidesData(): Promise<DataFile<MunicipalDataRecord>> {
  return loadLayerData<MunicipalDataRecord>('homicidios');
}

/**
 * Loads clandestine taps data specifically
 */
export async function loadClandestineTapsData(): Promise<DataFile<MunicipalDataRecord>> {
  return loadLayerData<MunicipalDataRecord>('tomas_clandestinas');
}

/**
 * Loads social lag data specifically
 */
export async function loadSocialLagData(): Promise<DataFile<MunicipalDataRecord>> {
  return loadLayerData<MunicipalDataRecord>('rezago_social');
}

/**
 * Loads institutional capacity data specifically
 */
export async function loadInstitutionalCapacityData(): Promise<DataFile<MunicipalDataRecord>> {
  return loadLayerData<MunicipalDataRecord>('capacidad_instalada');
}

/**
 * Loads all available layer data for the atlas
 */
export async function loadAllAtlasData(): Promise<Map<string, DataFile>> {
  const layerIds = Object.keys(ATLAS_LAYERS);
  return loadMultipleLayerData(layerIds);
}
