/**
 * GeoJSON Validation System for Guanajuato Municipalities
 * 
 * Validates GeoJSON data against official INEGI standards
 * and identifies data integrity issues that need fixing.
 */

import { MunicipalitiesGeoJSON } from './geoUtils';

/** Official INEGI municipality data for Guanajuato */
export interface INEGIMunicipalityData {
  clave: string;           // Official INEGI code (e.g., "11001")
  nombre: string;          // Official name
  nombreCompleto?: string; // Full official name
  cabecera?: string;       // Municipal seat
  superficie?: number;     // Area in km²
  poblacion?: number;      // Population (latest census)
}

/**
 * Official INEGI municipalities for Guanajuato State (11)
 * Source: INEGI - Catálogo de Entidades, Municipios y Localidades
 */
export const INEGI_GUANAJUATO_MUNICIPALITIES: INEGIMunicipalityData[] = [
  { clave: "11001", nombre: "Abasolo" },
  { clave: "11002", nombre: "Acámbaro" },
  { clave: "11003", nombre: "San Miguel de Allende" },
  { clave: "11004", nombre: "Apaseo el Alto" },
  { clave: "11005", nombre: "Apaseo el Grande" },
  { clave: "11006", nombre: "Atarjea" },
  { clave: "11007", nombre: "Celaya" },
  { clave: "11008", nombre: "Manuel Doblado" },
  { clave: "11009", nombre: "Comonfort" },
  { clave: "11010", nombre: "Coroneo" },
  { clave: "11011", nombre: "Cortazar" },
  { clave: "11012", nombre: "Cuerámaro" },
  { clave: "11013", nombre: "Doctor Mora" },
  { clave: "11014", nombre: "Dolores Hidalgo Cuna de la Independencia Nacional" },
  { clave: "11015", nombre: "Guanajuato" },
  { clave: "11016", nombre: "Huanímaro" },
  { clave: "11017", nombre: "Irapuato" },
  { clave: "11018", nombre: "Jaral del Progreso" },
  { clave: "11019", nombre: "Jerécuaro" },
  { clave: "11020", nombre: "León" },
  { clave: "11021", nombre: "Moroleón" },
  { clave: "11022", nombre: "Ocampo" },
  { clave: "11023", nombre: "Pénjamo" },
  { clave: "11024", nombre: "Pueblo Nuevo" },
  { clave: "11025", nombre: "Purísima del Rincón" },
  { clave: "11026", nombre: "Romita" },
  { clave: "11027", nombre: "Salamanca" },
  { clave: "11028", nombre: "Salvatierra" },
  { clave: "11029", nombre: "San Diego de la Unión" },
  { clave: "11030", nombre: "San Felipe" },
  { clave: "11031", nombre: "San Francisco del Rincón" },
  { clave: "11032", nombre: "San José Iturbide" },
  { clave: "11033", nombre: "San Luis de la Paz" },
  { clave: "11034", nombre: "Santa Catarina" },
  { clave: "11035", nombre: "Santa Cruz de Juventino Rosas" },
  { clave: "11036", nombre: "Santiago Maravatío" },
  { clave: "11037", nombre: "Silao de la Victoria", nombreCompleto: "Silao de la Victoria" },
  { clave: "11038", nombre: "Tarandacuao" },
  { clave: "11039", nombre: "Tarimoro" },
  { clave: "11040", nombre: "Tierra Blanca" },
  { clave: "11041", nombre: "Uriangato" },
  { clave: "11042", nombre: "Valle de Santiago" },
  { clave: "11043", nombre: "Victoria" },
  { clave: "11044", nombre: "Villagrán" },
  { clave: "11045", nombre: "Xichú" },
  { clave: "11046", nombre: "Yuriria" }
];

/** Validation issue types */
export type ValidationIssueType = 
  | 'missing_municipality'
  | 'extra_municipality' 
  | 'wrong_code'
  | 'wrong_name'
  | 'invalid_geometry'
  | 'missing_properties'
  | 'invalid_state_code';

/** Validation issue report */
export interface ValidationIssue {
  type: ValidationIssueType;
  severity: 'error' | 'warning' | 'info';
  municipality?: string;
  expected?: string;
  actual?: string;
  description: string;
  suggestion?: string;
}

/** Complete validation report */
export interface ValidationReport {
  isValid: boolean;
  totalMunicipalities: number;
  expectedMunicipalities: number;
  issues: ValidationIssue[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}

/**
 * Validates GeoJSON against official INEGI data
 * 
 * @param geoJsonData - GeoJSON data to validate
 * @returns Comprehensive validation report
 */
export function validateGeoJSONIntegrity(geoJsonData: MunicipalitiesGeoJSON): ValidationReport {
  const issues: ValidationIssue[] = [];
  
  console.log('🔍 Starting GeoJSON validation against INEGI standards...');
  
  // 1. Check basic structure
  if (!geoJsonData.features || !Array.isArray(geoJsonData.features)) {
    issues.push({
      type: 'missing_properties',
      severity: 'error',
      description: 'GeoJSON does not have valid features array',
      suggestion: 'Ensure GeoJSON has "features" array property'
    });
    
    return {
      isValid: false,
      totalMunicipalities: 0,
      expectedMunicipalities: INEGI_GUANAJUATO_MUNICIPALITIES.length,
      issues,
      summary: { errors: 1, warnings: 0, info: 0 }
    };
  }
  
  // 2. Create lookup maps for validation
  const inegiByCode = new Map<string, INEGIMunicipalityData>();
  const inegiByName = new Map<string, INEGIMunicipalityData>();
  
  INEGI_GUANAJUATO_MUNICIPALITIES.forEach(mun => {
    inegiByCode.set(mun.clave, mun);
    inegiByName.set(mun.nombre.toLowerCase(), mun);
  });
  
  // 3. Track what we find in GeoJSON
  const foundCodes = new Set<string>();
  const foundNames = new Set<string>();
  
  // 4. Validate each feature
  geoJsonData.features.forEach((feature, index) => {
    const props = feature.properties;
    
    // Check required properties
    if (!props.state_code || !props.mun_code || !props.mun_name) {
      issues.push({
        type: 'missing_properties',
        severity: 'error',
        municipality: `Feature ${index}`,
        description: 'Missing required properties (state_code, mun_code, mun_name)',
        suggestion: 'Add missing properties to GeoJSON feature'
      });
      return;
    }
    
    // Check state code
    if (props.state_code !== 11) {
      issues.push({
        type: 'invalid_state_code',
        severity: 'error',
        municipality: props.mun_name,
        expected: '11',
        actual: props.state_code.toString(),
        description: `Invalid state code for Guanajuato`,
        suggestion: 'State code should be 11 for Guanajuato'
      });
    }
    
    // Generate expected INEGI code
    const expectedCode = `11${props.mun_code.toString().padStart(3, '0')}`;
    foundCodes.add(expectedCode);
    foundNames.add(props.mun_name.toLowerCase());
    
    // Check if municipality exists in INEGI data
    const inegiByCodeMatch = inegiByCode.get(expectedCode);
    const inegiByNameMatch = inegiByName.get(props.mun_name.toLowerCase());
    
    if (!inegiByCodeMatch && !inegiByNameMatch) {
      issues.push({
        type: 'missing_municipality',
        severity: 'error',
        municipality: props.mun_name,
        expected: 'Valid INEGI municipality',
        actual: `${props.mun_name} (${expectedCode})`,
        description: `Municipality not found in official INEGI catalog`,
        suggestion: 'Verify municipality name and code against INEGI data'
      });
    } else if (inegiByCodeMatch && inegiByNameMatch) {
      // Perfect match
      console.log(`✅ ${props.mun_name} (${expectedCode}) - Perfect match`);
    } else if (inegiByCodeMatch && !inegiByNameMatch) {
      // Code matches but name doesn't
      issues.push({
        type: 'wrong_name',
        severity: 'warning',
        municipality: props.mun_name,
        expected: inegiByCodeMatch.nombre,
        actual: props.mun_name,
        description: `Municipality name doesn't match INEGI official name`,
        suggestion: `Consider using official name: "${inegiByCodeMatch.nombre}"`
      });
    } else if (!inegiByCodeMatch && inegiByNameMatch) {
      // Name matches but code doesn't
      const correctCode = inegiByNameMatch.clave;
      const correctMunCode = parseInt(correctCode.slice(2));
      
      issues.push({
        type: 'wrong_code',
        severity: 'error',
        municipality: props.mun_name,
        expected: `mun_code: ${correctMunCode}`,
        actual: `mun_code: ${props.mun_code}`,
        description: `Municipality code doesn't match INEGI official code`,
        suggestion: `Change mun_code from ${props.mun_code} to ${correctMunCode}`
      });
    }
    
    // Check geometry validity (basic)
    if (!feature.geometry || !feature.geometry.coordinates) {
      issues.push({
        type: 'invalid_geometry',
        severity: 'error',
        municipality: props.mun_name,
        description: 'Invalid or missing geometry',
        suggestion: 'Ensure feature has valid geometry with coordinates'
      });
    }
  });
  
  // 5. Check for missing municipalities
  INEGI_GUANAJUATO_MUNICIPALITIES.forEach(inegiMun => {
    if (!foundCodes.has(inegiMun.clave) && !foundNames.has(inegiMun.nombre.toLowerCase())) {
      issues.push({
        type: 'missing_municipality',
        severity: 'warning',
        municipality: inegiMun.nombre,
        expected: inegiMun.clave,
        description: `Official municipality missing from GeoJSON`,
        suggestion: `Add ${inegiMun.nombre} (${inegiMun.clave}) to GeoJSON`
      });
    }
  });
  
  // 6. Generate summary
  const summary = {
    errors: issues.filter(i => i.severity === 'error').length,
    warnings: issues.filter(i => i.severity === 'warning').length,
    info: issues.filter(i => i.severity === 'info').length
  };
  
  const isValid = summary.errors === 0;
  
  console.log(`📊 Validation complete:`);
  console.log(`   Total municipalities in GeoJSON: ${geoJsonData.features.length}`);
  console.log(`   Expected municipalities (INEGI): ${INEGI_GUANAJUATO_MUNICIPALITIES.length}`);
  console.log(`   Errors: ${summary.errors}`);
  console.log(`   Warnings: ${summary.warnings}`);
  console.log(`   Valid: ${isValid ? '✅' : '❌'}`);
  
  return {
    isValid,
    totalMunicipalities: geoJsonData.features.length,
    expectedMunicipalities: INEGI_GUANAJUATO_MUNICIPALITIES.length,
    issues,
    summary
  };
}

/**
 * Generates a detailed validation report for console output
 * 
 * @param report - Validation report
 * @returns Formatted report string
 */
export function generateValidationReport(report: ValidationReport): string {
  let output = '\n🔍 GEOJSON VALIDATION REPORT\n';
  output += '='.repeat(50) + '\n\n';
  
  output += `📊 SUMMARY:\n`;
  output += `   Status: ${report.isValid ? '✅ VALID' : '❌ INVALID'}\n`;
  output += `   Municipalities: ${report.totalMunicipalities}/${report.expectedMunicipalities}\n`;
  output += `   Errors: ${report.summary.errors}\n`;
  output += `   Warnings: ${report.summary.warnings}\n`;
  output += `   Info: ${report.summary.info}\n\n`;
  
  if (report.issues.length > 0) {
    output += `🚨 ISSUES FOUND:\n\n`;
    
    // Group by severity
    const errorIssues = report.issues.filter(i => i.severity === 'error');
    const warningIssues = report.issues.filter(i => i.severity === 'warning');
    // const infoIssues = report.issues.filter(i => i.severity === 'info');
    
    if (errorIssues.length > 0) {
      output += `❌ ERRORS (${errorIssues.length}):\n`;
      errorIssues.forEach((issue, i) => {
        output += `   ${i + 1}. ${issue.municipality || 'Unknown'}\n`;
        output += `      Problem: ${issue.description}\n`;
        if (issue.expected && issue.actual) {
          output += `      Expected: ${issue.expected}\n`;
          output += `      Actual: ${issue.actual}\n`;
        }
        if (issue.suggestion) {
          output += `      Fix: ${issue.suggestion}\n`;
        }
        output += '\n';
      });
    }
    
    if (warningIssues.length > 0) {
      output += `⚠️  WARNINGS (${warningIssues.length}):\n`;
      warningIssues.forEach((issue, i) => {
        output += `   ${i + 1}. ${issue.municipality || 'Unknown'}\n`;
        output += `      Issue: ${issue.description}\n`;
        if (issue.expected && issue.actual) {
          output += `      Expected: ${issue.expected}\n`;
          output += `      Actual: ${issue.actual}\n`;
        }
        if (issue.suggestion) {
          output += `      Suggestion: ${issue.suggestion}\n`;
        }
        output += '\n';
      });
    }
  } else {
    output += `✅ NO ISSUES FOUND - GeoJSON is valid!\n`;
  }
  
  return output;
}

/**
 * Creates a corrected GeoJSON based on validation issues
 * 
 * @param geoJsonData - Original GeoJSON
 * @param report - Validation report with issues
 * @returns Corrected GeoJSON data
 */
export function createCorrectedGeoJSON(
  geoJsonData: MunicipalitiesGeoJSON
): MunicipalitiesGeoJSON {
  console.log('🔧 Creating corrected GeoJSON...');
  
  // Create lookup for corrections
  const inegiByName = new Map<string, INEGIMunicipalityData>();
  INEGI_GUANAJUATO_MUNICIPALITIES.forEach(mun => {
    inegiByName.set(mun.nombre.toLowerCase(), mun);
  });
  
  const correctedFeatures = geoJsonData.features.map(feature => {
    const props = feature.properties;
    const inegiMatch = inegiByName.get(props.mun_name.toLowerCase());
    
    if (inegiMatch) {
      const correctMunCode = parseInt(inegiMatch.clave.slice(2));
      
      return {
        ...feature,
        properties: {
          ...props,
          mun_code: correctMunCode,
          mun_name: inegiMatch.nombre,
          // Add INEGI code for reference
          inegi_code: inegiMatch.clave
        }
      };
    }
    
    return feature;
  });
  
  return {
    type: 'FeatureCollection',
    features: correctedFeatures
  };
}
