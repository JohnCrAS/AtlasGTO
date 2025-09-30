/**
 * Data Joining System - Atlas de Riesgo
 * 
 * Joins JSON data with GeoJSON geometries for visualization.
 * Designed to handle missing data gracefully and provide clear
 * feedback about data alignment issues.
 * 
 * This system makes it easy to:
 * - Add new data layers without changing core logic
 * - Handle mismatched municipality codes
 * - Provide fallback values for missing data
 * - Scale from dummy data to real data seamlessly
 */

import type { MunicipalitiesGeoJSON, MunicipalityFeature } from './geoUtils';
import type { DataFile, MunicipalDataRecord } from './dataLoader';
import { createMunicipalityLookup, validateMunicipalityAlignment } from './dataLoader';

/** Enhanced GeoJSON feature with joined data */
export interface EnhancedMunicipalityFeature<T extends MunicipalDataRecord = MunicipalDataRecord> 
  extends Omit<MunicipalityFeature, 'properties'> {
  properties: {
    // Original GeoJSON properties  
    cvegeo: string;
    nombre: string;
    // Raw GeoJSON fields
    id: null;
    state_code: number;
    mun_code: number;
    mun_name: string;
    [key: string]: unknown;
    
    // Joined data
    data?: T;
    hasData: boolean;
    dataSource?: string;
  };
}

/** Enhanced GeoJSON collection with joined data */
export interface EnhancedMunicipalitiesGeoJSON<T extends MunicipalDataRecord = MunicipalDataRecord> {
  type: 'FeatureCollection';
  features: EnhancedMunicipalityFeature<T>[];
  metadata: {
    totalFeatures: number;
    featuresWithData: number;
    dataAlignment: number; // 0-1 ratio of successful joins
    missingDataCodes: string[];
    dataSource: string;
    joinedAt: string;
  };
}

/**
 * Joins JSON data with GeoJSON geometries
 * 
 * @param geoJson - Municipal geometries
 * @param dataFile - JSON data file to join
 * @param options - Join configuration options
 * @returns Enhanced GeoJSON with joined data
 */
export function joinDataWithGeometries<T extends MunicipalDataRecord>(
  geoJson: MunicipalitiesGeoJSON,
  dataFile: DataFile<T>,
  options: {
    geoCodeField?: string;    // Field in GeoJSON for municipality code
    dataCodeField?: string;   // Field in data for municipality code
    dataSourceName?: string;  // Name for metadata
  } = {}
): EnhancedMunicipalitiesGeoJSON<T> {
  const {
    geoCodeField = 'cvegeo',
    dataCodeField = 'municipio', 
    dataSourceName = 'Unknown'
  } = options;

  // Create lookup map for fast data access
  const dataLookup = createMunicipalityLookup(dataFile);
  
  // Get all municipality codes for validation
  const geoCodes = new Set(geoJson.features.map(f => f.properties[geoCodeField] as string));
  const dataCodes = new Set(dataFile.records.map(r => r[dataCodeField] as string));
  
  // Validate alignment
  const alignment = validateMunicipalityAlignment(geoCodes, dataCodes);
  
  console.log(`🔗 Joining ${dataSourceName} data:`);
  console.log(`   Geometries: ${geoCodes.size}, Data records: ${dataCodes.size}`);
  console.log(`   Successful joins: ${alignment.matching.length}`);
  if (alignment.missingInData.length > 0) {
    console.warn(`   Missing data for: ${alignment.missingInData.join(', ')}`);
  }
  if (alignment.missingInGeo.length > 0) {
    console.warn(`   Extra data for: ${alignment.missingInGeo.join(', ')}`);
  }

  // Join data with geometries
  const enhancedFeatures: EnhancedMunicipalityFeature<T>[] = geoJson.features.map(feature => {
    const municipalityCode = feature.properties[geoCodeField] as string;
    const data = dataLookup.get(municipalityCode);
    
    // Ensure required fields are present
    const cvegeo = feature.properties.cvegeo || municipalityCode || 'unknown';
    const nombre = feature.properties.nombre || feature.properties.mun_name || 'Unknown';
    
    return {
      ...feature,
      properties: {
        ...feature.properties,
        cvegeo,
        nombre,
        data,
        hasData: !!data,
        dataSource: dataSourceName,
      },
    };
  });

  // Create enhanced GeoJSON
  const enhancedGeoJson: EnhancedMunicipalitiesGeoJSON<T> = {
    type: 'FeatureCollection',
    features: enhancedFeatures,
    metadata: {
      totalFeatures: enhancedFeatures.length,
      featuresWithData: enhancedFeatures.filter(f => f.properties.hasData).length,
      dataAlignment: alignment.alignmentRatio,
      missingDataCodes: alignment.missingInData,
      dataSource: dataSourceName,
      joinedAt: new Date().toISOString(),
    },
  };

  return enhancedGeoJson;
}

/**
 * Creates a choropleth color mapping function based on data values
 * 
 * @param enhancedGeoJson - GeoJSON with joined data
 * @param valueExtractor - Function to extract numeric value from data
 * @param colorScale - Array of colors from low to high
 * @param options - Mapping options
 * @returns Function that maps municipality code to color
 */
export function createChoroplethMapping<T extends MunicipalDataRecord>(
  enhancedGeoJson: EnhancedMunicipalitiesGeoJSON<T>,
  valueExtractor: (data: T) => number,
  colorScale: string[],
  options: {
    method?: 'quintiles' | 'equal-interval' | 'natural-breaks';
    noDataColor?: string;
    missingDataValue?: number;
  } = {}
): (municipalityCode: string) => string {
  const {
    method = 'quintiles',
    noDataColor = '#cccccc',
    missingDataValue = 0
  } = options;

  // Extract values from features with data
  const values: number[] = [];
  const valueMap = new Map<string, number>();

  enhancedGeoJson.features.forEach(feature => {
    const code = feature.properties.cvegeo;
    if (feature.properties.hasData && feature.properties.data) {
      const value = valueExtractor(feature.properties.data);
      values.push(value);
      valueMap.set(code, value);
    } else {
      valueMap.set(code, missingDataValue);
    }
  });

  if (values.length === 0) {
    console.warn('No data values found for choropleth mapping');
    return () => noDataColor;
  }

  // Calculate breaks based on method
  let breaks: number[];
  
  if (method === 'quintiles') {
    values.sort((a, b) => a - b);
    const quintileSize = Math.floor(values.length / 5);
    breaks = [
      values[0],
      values[quintileSize] || values[0],
      values[quintileSize * 2] || values[0],
      values[quintileSize * 3] || values[0],
      values[quintileSize * 4] || values[0],
      values[values.length - 1]
    ];
  } else {
    // Equal interval (simple for now)
    const min = Math.min(...values);
    const max = Math.max(...values);
    const interval = (max - min) / (colorScale.length - 1);
    breaks = Array.from({ length: colorScale.length }, (_, i) => min + (interval * i));
  }

  console.log(`🎨 Choropleth mapping created:`);
  console.log(`   Method: ${method}, Colors: ${colorScale.length}`);
  console.log(`   Value range: ${Math.min(...values).toFixed(1)} - ${Math.max(...values).toFixed(1)}`);
  console.log(`   Breaks: ${breaks.map(b => b.toFixed(1)).join(', ')}`);

  // Return mapping function
  return (municipalityCode: string): string => {
    const value = valueMap.get(municipalityCode);
    
    if (value === undefined || value === missingDataValue) {
      return noDataColor;
    }

    // Find appropriate color based on breaks
    for (let i = breaks.length - 1; i >= 0; i--) {
      if (value >= breaks[i]) {
        return colorScale[Math.min(i, colorScale.length - 1)];
      }
    }

    return colorScale[0];
  };
}

/**
 * Extracts summary statistics from joined data
 * 
 * @param enhancedGeoJson - GeoJSON with joined data  
 * @param valueExtractor - Function to extract numeric value
 * @returns Summary statistics object
 */
export function extractDataSummary<T extends MunicipalDataRecord>(
  enhancedGeoJson: EnhancedMunicipalitiesGeoJSON<T>,
  valueExtractor: (data: T) => number
) {
  const values = enhancedGeoJson.features
    .filter(f => f.properties.hasData && f.properties.data)
    .map(f => valueExtractor(f.properties.data!));

  if (values.length === 0) {
    return {
      count: 0,
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      std: 0
    };
  }

  values.sort((a, b) => a - b);
  const count = values.length;
  const min = values[0];
  const max = values[count - 1];
  const mean = values.reduce((sum, val) => sum + val, 0) / count;
  const median = count % 2 === 0 
    ? (values[count / 2 - 1] + values[count / 2]) / 2
    : values[Math.floor(count / 2)];
  
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / count;
  const std = Math.sqrt(variance);

  return { count, min, max, mean, median, std };
}
