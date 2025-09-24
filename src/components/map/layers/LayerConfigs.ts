/**
 * Configuration definitions for all map layers
 */

import { RISK_INDEX_COLORS } from '@/lib/atlasConfig';
import type { LayerConfig } from './LayerFactory';

/**
 * Creates layer configurations for all data layers
 */
export function createLayerConfigs(allData: Map<string, any>): LayerConfig[] {
  return [
    // === COMPOSITE RISK INDEX ===
    { 
      id: 'indice_riesgo', 
      type: 'choropleth', 
      data: allData.get('indice_riesgo'),
      colorScale: [
        RISK_INDEX_COLORS.MUY_BAJO,    // 0-20: Very Low Risk
        RISK_INDEX_COLORS.BAJO,        // 21-40: Low Risk  
        RISK_INDEX_COLORS.MEDIO,       // 41-60: Medium Risk
        RISK_INDEX_COLORS.ALTO,        // 61-80: High Risk
        RISK_INDEX_COLORS.MUY_ALTO,    // 81-100: Very High Risk
      ],
      valueExtractor: (data: any) => data.indice,
      colorLogic: 'danger' // Higher values = more dangerous (darker blue)
    },
    
    // === DISAPPEARANCES (Crime Data) ===
    {
      id: 'desapariciones',
      type: 'choropleth',
      data: allData.get('desapariciones'),
      colorScale: [
        '#fff5f5', '#fed7d7', '#feb2b2', '#fc8181', '#e53e3e'  // White to Red
      ],
      valueExtractor: (data: any) => data.casos || 0,
      colorLogic: 'danger', // More cases = more dangerous = red
      unit: 'casos'
    },
    
    // === HOMICIDES (Crime Data) ===
    {
      id: 'homicidios',
      type: 'choropleth',
      data: allData.get('homicidios'),
      colorScale: [
        '#fff5f5', '#fed7d7', '#feb2b2', '#fc8181', '#e53e3e'  // White to Red
      ],
      valueExtractor: (data: any) => data.casos || data.tasa || 0,
      colorLogic: 'danger', // More cases = more dangerous = red
      unit: 'casos'
    },
    
    // === CLANDESTINE TAPS (Crime Data) ===
    {
      id: 'tomas_clandestinas',
      type: 'choropleth',
      data: allData.get('tomas_clandestinas'),
      colorScale: [
        '#fff5f5', '#fed7d7', '#feb2b2', '#fc8181', '#e53e3e'  // White to Red
      ],
      valueExtractor: (data: any) => data.tomas || 0,
      colorLogic: 'danger', // More taps = more dangerous = red
      unit: 'tomas'
    },
    
    // === SOCIAL LAG (Vulnerability Data) ===
    {
      id: 'rezago_social',
      type: 'choropleth',
      data: allData.get('rezago_social'),
      colorScale: [
        '#f0fff4', '#c6f6d5', '#9ae6b4', '#68d391', '#38a169'  // Light to Dark Green (inverted)
      ],
      valueExtractor: (data: any) => Math.abs(data.irs || 0), // Use absolute value of IRS
      colorLogic: 'danger', // Higher lag = more vulnerable = red-ish
      unit: 'índice'
    },
    
    // === INSTITUTIONAL CAPACITY (Protection Data) ===
    {
      id: 'capacidad_instalada',
      type: 'choropleth',
      data: allData.get('capacidad_instalada'),
      colorScale: [
        '#fff5f5', '#c6f6d5', '#9ae6b4', '#68d391', '#38a169'  // Red to Green
      ],
      valueExtractor: (data: any) => {
        // Calculate total institutional capacity
        const centros = data.centros_salud || 0;
        const refugios = data.refugios || 0;
        const instituciones = (data.comision_busqueda ? 1 : 0) + 
                             (data.imug_imm ? 1 : 0) + 
                             (data.fiscalia ? 1 : 0) + 
                             (data.c5i ? 1 : 0);
        return centros + refugios + instituciones;
      },
      colorLogic: 'safety', // More capacity = safer = green
      unit: 'instituciones'
    }
  ];
}
