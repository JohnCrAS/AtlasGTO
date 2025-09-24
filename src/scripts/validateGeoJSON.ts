/**
 * GeoJSON Validation Script
 * 
 * Run this to validate your municipios_gto.geojson file
 * against official INEGI standards and get detailed reports.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { validateGeoJSONIntegrity, generateValidationReport, createCorrectedGeoJSON } from '../lib/geoJsonValidator';
import type { MunicipalitiesGeoJSON } from '../lib/geoUtils';

async function main() {
  console.log('🔍 Starting GeoJSON validation process...\n');
  
  try {
    // 1. Load the GeoJSON file
    const geoJsonPath = join(process.cwd(), 'public', 'geo', 'municipios_gto.geojson');
    console.log(`📂 Loading GeoJSON from: ${geoJsonPath}`);
    
    const rawData = readFileSync(geoJsonPath, 'utf-8');
    const geoJsonData: MunicipalitiesGeoJSON = JSON.parse(rawData);
    
    console.log(`✅ Loaded ${geoJsonData.features.length} municipalities from GeoJSON\n`);
    
    // 2. Validate the data
    const validationReport = validateGeoJSONIntegrity(geoJsonData);
    
    // 3. Generate and display report
    const reportText = generateValidationReport(validationReport);
    console.log(reportText);
    
    // 4. Save report to file
    const reportPath = join(process.cwd(), 'geojson-validation-report.txt');
    writeFileSync(reportPath, reportText);
    console.log(`📝 Validation report saved to: ${reportPath}\n`);
    
    // 5. Create corrected version if needed
    if (!validationReport.isValid) {
      console.log('🔧 Creating corrected GeoJSON...');
      
      const correctedGeoJSON = createCorrectedGeoJSON(geoJsonData);
      const correctedPath = join(process.cwd(), 'public', 'geo', 'municipios_gto_corrected.geojson');
      
      writeFileSync(correctedPath, JSON.stringify(correctedGeoJSON, null, 2));
      console.log(`✅ Corrected GeoJSON saved to: ${correctedPath}`);
      console.log(`   Review the corrections and replace the original file if appropriate.\n`);
    }
    
    // 6. Summary
    console.log('📊 VALIDATION SUMMARY:');
    console.log(`   Status: ${validationReport.isValid ? '✅ VALID' : '❌ NEEDS FIXES'}`);
    console.log(`   Total Issues: ${validationReport.issues.length}`);
    console.log(`   Errors: ${validationReport.summary.errors}`);
    console.log(`   Warnings: ${validationReport.summary.warnings}`);
    
    if (validationReport.summary.errors > 0) {
      console.log('\n🚨 Action Required:');
      console.log('   - Review the validation report above');
      console.log('   - Fix the identified errors in your GeoJSON');
      console.log('   - Re-run validation to confirm fixes');
      process.exit(1);
    } else if (validationReport.summary.warnings > 0) {
      console.log('\n⚠️  Recommendations:');
      console.log('   - Review warnings for data quality improvements');
      console.log('   - Consider using official INEGI names');
      process.exit(0);
    } else {
      console.log('\n🎉 Perfect! Your GeoJSON is fully compliant with INEGI standards.');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
