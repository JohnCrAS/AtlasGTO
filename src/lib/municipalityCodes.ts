/**
 * Municipality Code Mapping - Guanajuato
 * 
 * Maps between different municipality code formats:
 * - GeoJSON: separate state_code + mun_code 
 * - Data JSON: combined 5-digit codes
 * - Official names and metadata
 */

/** Municipality information from official sources */
export interface MunicipalityInfo {
  geoJsonCode: number;        // mun_code in GeoJSON (1-46)
  dataCode: string;           // municipio code in JSON ("11001"-"11046")
  officialName: string;       // Official municipality name
  commonName?: string;        // Common/alternative name
  population?: number;        // Population (for reference)
}

/**
 * Official mapping of Guanajuato municipalities
 * Source: INEGI - Instituto Nacional de Estadística y Geografía
 */
export const GUANAJUATO_MUNICIPALITIES: Record<number, MunicipalityInfo> = {
  1:  { geoJsonCode: 1,  dataCode: "11001", officialName: "Abasolo" },
  2:  { geoJsonCode: 2,  dataCode: "11002", officialName: "Acámbaro" },
  3:  { geoJsonCode: 3,  dataCode: "11003", officialName: "San Miguel de Allende" },
  4:  { geoJsonCode: 4,  dataCode: "11004", officialName: "Apaseo el Alto" },
  5:  { geoJsonCode: 5,  dataCode: "11005", officialName: "Apaseo el Grande" },
  6:  { geoJsonCode: 6,  dataCode: "11006", officialName: "Atarjea" },
  7:  { geoJsonCode: 7,  dataCode: "11007", officialName: "Celaya" },
  8:  { geoJsonCode: 8,  dataCode: "11008", officialName: "Manuel Doblado" },
  9:  { geoJsonCode: 9,  dataCode: "11009", officialName: "Comonfort" },
  10: { geoJsonCode: 10, dataCode: "11010", officialName: "Coroneo" },
  11: { geoJsonCode: 11, dataCode: "11011", officialName: "Cortazar" },
  12: { geoJsonCode: 12, dataCode: "11012", officialName: "Cuerámaro" },
  13: { geoJsonCode: 13, dataCode: "11013", officialName: "Doctor Mora" },
  14: { geoJsonCode: 14, dataCode: "11014", officialName: "Dolores Hidalgo Cuna de la Independencia Nacional", commonName: "Dolores Hidalgo" },
  15: { geoJsonCode: 15, dataCode: "11015", officialName: "Guanajuato" },
  16: { geoJsonCode: 16, dataCode: "11016", officialName: "Huanímaro" },
  17: { geoJsonCode: 17, dataCode: "11017", officialName: "Irapuato" },
  18: { geoJsonCode: 18, dataCode: "11018", officialName: "Jaral del Progreso" },
  19: { geoJsonCode: 19, dataCode: "11019", officialName: "Jerécuaro" },
  20: { geoJsonCode: 20, dataCode: "11020", officialName: "León" },
  21: { geoJsonCode: 21, dataCode: "11021", officialName: "Moroleón" },
  22: { geoJsonCode: 22, dataCode: "11022", officialName: "Ocampo" },
  23: { geoJsonCode: 23, dataCode: "11023", officialName: "Pénjamo" },
  24: { geoJsonCode: 24, dataCode: "11024", officialName: "Pueblo Nuevo" },
  25: { geoJsonCode: 25, dataCode: "11025", officialName: "Purísima del Rincón" },
  26: { geoJsonCode: 26, dataCode: "11026", officialName: "Romita" },
  27: { geoJsonCode: 27, dataCode: "11027", officialName: "Salamanca" },
  28: { geoJsonCode: 28, dataCode: "11028", officialName: "Salvatierra" },
  29: { geoJsonCode: 29, dataCode: "11029", officialName: "San Diego de la Unión" },
  30: { geoJsonCode: 30, dataCode: "11030", officialName: "San Felipe" },
  31: { geoJsonCode: 31, dataCode: "11031", officialName: "San Francisco del Rincón" },
  32: { geoJsonCode: 32, dataCode: "11032", officialName: "San José Iturbide" },
  33: { geoJsonCode: 33, dataCode: "11033", officialName: "San Luis de la Paz" },
  34: { geoJsonCode: 34, dataCode: "11034", officialName: "Santa Catarina" },
  35: { geoJsonCode: 35, dataCode: "11035", officialName: "Santa Cruz de Juventino Rosas" },
  36: { geoJsonCode: 36, dataCode: "11036", officialName: "Santiago Maravatío" },
  37: { geoJsonCode: 37, dataCode: "11037", officialName: "Silao" },
  38: { geoJsonCode: 38, dataCode: "11038", officialName: "Tarandacuao" },
  39: { geoJsonCode: 39, dataCode: "11039", officialName: "Tarimoro" },
  40: { geoJsonCode: 40, dataCode: "11040", officialName: "Tierra Blanca" },
  41: { geoJsonCode: 41, dataCode: "11041", officialName: "Uriangato" },
  42: { geoJsonCode: 42, dataCode: "11042", officialName: "Valle de Santiago" },
  43: { geoJsonCode: 43, dataCode: "11043", officialName: "Victoria" },
  44: { geoJsonCode: 44, dataCode: "11044", officialName: "Villagrán" },
  45: { geoJsonCode: 45, dataCode: "11045", officialName: "Xichú" },
  46: { geoJsonCode: 46, dataCode: "11046", officialName: "Yuriria" },
};

/**
 * Creates a lookup map from GeoJSON mun_code to data municipio code
 * 
 * @returns Map with GeoJSON codes as keys and data codes as values
 */
export function createGeoToDataCodeMap(): Map<number, string> {
  const map = new Map<number, string>();
  
  Object.values(GUANAJUATO_MUNICIPALITIES).forEach(info => {
    map.set(info.geoJsonCode, info.dataCode);
  });
  
  return map;
}

/**
 * Creates a lookup map from data municipio code to GeoJSON mun_code
 * 
 * @returns Map with data codes as keys and GeoJSON codes as values
 */
export function createDataToGeoCodeMap(): Map<string, number> {
  const map = new Map<string, number>();
  
  Object.values(GUANAJUATO_MUNICIPALITIES).forEach(info => {
    map.set(info.dataCode, info.geoJsonCode);
  });
  
  return map;
}

/**
 * Gets municipality info by GeoJSON code
 * 
 * @param geoJsonCode - mun_code from GeoJSON
 * @returns Municipality information or undefined
 */
export function getMunicipalityByGeoCode(geoJsonCode: number): MunicipalityInfo | undefined {
  return GUANAJUATO_MUNICIPALITIES[geoJsonCode];
}

/**
 * Gets municipality info by data code
 * 
 * @param dataCode - municipio code from JSON data
 * @returns Municipality information or undefined
 */
export function getMunicipalityByDataCode(dataCode: string): MunicipalityInfo | undefined {
  return Object.values(GUANAJUATO_MUNICIPALITIES).find(info => info.dataCode === dataCode);
}

/**
 * Converts GeoJSON mun_code to data municipio code
 * 
 * @param geoJsonCode - mun_code from GeoJSON
 * @returns Corresponding data code or undefined
 */
export function geoCodeToDataCode(geoJsonCode: number): string | undefined {
  return GUANAJUATO_MUNICIPALITIES[geoJsonCode]?.dataCode;
}

/**
 * Converts data municipio code to GeoJSON mun_code
 * 
 * @param dataCode - municipio code from JSON data
 * @returns Corresponding GeoJSON code or undefined
 */
export function dataCodeToGeoCode(dataCode: string): number | undefined {
  return Object.values(GUANAJUATO_MUNICIPALITIES).find(info => info.dataCode === dataCode)?.geoJsonCode;
}

/**
 * Validates and reports alignment between GeoJSON and data codes
 * 
 * @param geoJsonCodes - Array of mun_codes from GeoJSON
 * @param dataCodes - Array of municipio codes from JSON data
 * @returns Alignment report
 */
export function validateCodeAlignment(geoJsonCodes: number[], dataCodes: string[]) {
  const geoSet = new Set(geoJsonCodes);
  const dataSet = new Set(dataCodes);
  
  const matched: Array<{ geoCode: number; dataCode: string; name: string }> = [];
  const missingInData: Array<{ geoCode: number; expectedDataCode: string; name: string }> = [];
  const missingInGeo: Array<{ dataCode: string; expectedGeoCode?: number; name?: string }> = [];
  
  // Check GeoJSON codes
  geoJsonCodes.forEach(geoCode => {
    const expectedDataCode = geoCodeToDataCode(geoCode);
    const info = getMunicipalityByGeoCode(geoCode);
    
    if (expectedDataCode && dataSet.has(expectedDataCode)) {
      matched.push({
        geoCode,
        dataCode: expectedDataCode,
        name: info?.officialName || 'Unknown'
      });
    } else {
      missingInData.push({
        geoCode,
        expectedDataCode: expectedDataCode || 'Unknown',
        name: info?.officialName || 'Unknown'
      });
    }
  });
  
  // Check data codes
  dataCodes.forEach(dataCode => {
    const expectedGeoCode = dataCodeToGeoCode(dataCode);
    const info = getMunicipalityByDataCode(dataCode);
    
    if (!expectedGeoCode || !geoSet.has(expectedGeoCode)) {
      missingInGeo.push({
        dataCode,
        expectedGeoCode,
        name: info?.officialName
      });
    }
  });
  
  return {
    matched,
    missingInData,
    missingInGeo,
    alignmentRatio: matched.length / Math.max(geoJsonCodes.length, dataCodes.length),
    summary: {
      total: Math.max(geoJsonCodes.length, dataCodes.length),
      matched: matched.length,
      geoJsonCount: geoJsonCodes.length,
      dataCount: dataCodes.length,
    }
  };
}
