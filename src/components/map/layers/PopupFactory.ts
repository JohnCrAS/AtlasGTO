/**
 * Factory for creating layer-specific popups
 */

import { GUANAJUATO_COLORS, RISK_INDEX_COLORS } from '@/lib/atlasConfig';
import type { LayerConfig } from './LayerFactory';

/**
 * Creates a popup with layer-specific content
 */
export function createLayerSpecificPopup(properties: any, config: LayerConfig): string {
  const { cvegeo, nombre, hasData, data } = properties;
  
  if (!hasData || !data) {
    return createNoDataPopup(nombre, cvegeo, config.id);
  }

  // Extract value using the layer's specific logic
  const value = config.valueExtractor(data);
  const unit = config.unit || '';
  
  // Create layer-specific content
  const layerContent = createLayerContent(config.id, value, unit, data);

  return `
    <div style="font-family: system-ui; padding: 12px; min-width: 250px;">
      <h3 style="margin: 0 0 8px 0; color: ${GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL}; font-size: 18px; font-weight: 600;">
        ${nombre}
      </h3>
      <div style="font-size: 14px; color: #666; line-height: 1.4;">
        <p style="margin: 4px 0;"><strong>Código:</strong> ${cvegeo}</p>
        ${layerContent}
        <div style="margin-top: 12px; padding: 6px; background-color: #f8f9fa; border-radius: 4px; font-size: 11px; color: #666;">
          <strong>Capa:</strong> ${config.id}
        </div>
      </div>
    </div>
  `;
}

/**
 * Creates popup content when no data is available
 */
function createNoDataPopup(nombre: string, cvegeo: string, layerId: string): string {
  return `
    <div style="font-family: system-ui; padding: 12px; min-width: 200px;">
      <h3 style="margin: 0 0 8px 0; color: ${GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL}; font-size: 18px; font-weight: 600;">
        ${nombre}
      </h3>
      <div style="font-size: 14px; color: #666; line-height: 1.4;">
        <p style="margin: 4px 0;"><strong>Código:</strong> ${cvegeo}</p>
        <div style="margin-top: 12px; padding: 8px; background-color: #f3f4f6; border-radius: 4px;">
          <p style="margin: 0; font-size: 12px; color: #666;">
            ⚠️ Sin datos disponibles para ${layerId}
          </p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Creates content specific to each layer type
 */
function createLayerContent(layerId: string, value: number, unit: string, data: any): string {
  switch (layerId) {
    case 'indice_riesgo':
      return createRiskIndexContent(value, data);
      
    case 'desapariciones':
      return createDisappearancesContent(value, unit, data);
      
    case 'homicidios':
      return createHomicidesContent(value, unit, data);
      
    case 'tomas_clandestinas':
      return createClandestineTapsContent(value, unit, data);
      
    case 'rezago_social':
      return createSocialLagContent(value, data);
      
    case 'capacidad_instalada':
      return createInstitutionalCapacityContent(value, unit, data);
      
    default:
      return createGenericContent(layerId, value, unit);
  }
}

function createRiskIndexContent(value: number, data: any): string {
  const riskLevel = value >= 80 ? 'Muy Alto' :
                   value >= 60 ? 'Alto' :
                   value >= 40 ? 'Medio' :
                   value >= 20 ? 'Bajo' : 'Muy Bajo';
  const riskColor = value >= 80 ? RISK_INDEX_COLORS.MUY_ALTO :
                   value >= 60 ? RISK_INDEX_COLORS.ALTO :
                   value >= 40 ? RISK_INDEX_COLORS.MEDIO :
                   value >= 20 ? RISK_INDEX_COLORS.BAJO : RISK_INDEX_COLORS.MUY_BAJO;
  
  return `
    <div style="margin: 12px 0; padding: 8px; background-color: ${riskColor}15; border-left: 3px solid ${riskColor}; border-radius: 4px;">
      <p style="margin: 0 0 4px 0; font-weight: 600; color: ${riskColor};">
        Índice de Riesgo: ${value.toFixed(1)}
      </p>
      <p style="margin: 0; font-size: 12px; color: #666;">
        Nivel: ${riskLevel}
      </p>
      ${data.top_factores ? `
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #666;">
          Factores: ${data.top_factores.join(', ')}
        </p>
      ` : ''}
    </div>
  `;
}

function createDisappearancesContent(value: number, unit: string, data: any): string {
  return `
    <div style="margin: 12px 0; padding: 8px; background-color: #fee; border-left: 3px solid #e53e3e; border-radius: 4px;">
      <p style="margin: 0 0 4px 0; font-weight: 600; color: #e53e3e;">
        Desapariciones: ${value} ${unit}
      </p>
      <p style="margin: 0; font-size: 12px; color: #666;">
        Período: ${data.año}-${String(data.mes).padStart(2, '0')}
      </p>
    </div>
  `;
}

function createHomicidesContent(value: number, unit: string, data: any): string {
  return `
    <div style="margin: 12px 0; padding: 8px; background-color: #fee; border-left: 3px solid #e53e3e; border-radius: 4px;">
      <p style="margin: 0 0 4px 0; font-weight: 600; color: #e53e3e;">
        Homicidios: ${value} ${unit}
      </p>
      ${data.tasa ? `
        <p style="margin: 0; font-size: 12px; color: #666;">
          Tasa: ${data.tasa} por 100k hab.
        </p>
      ` : ''}
    </div>
  `;
}

function createClandestineTapsContent(value: number, unit: string, data: any): string {
  return `
    <div style="margin: 12px 0; padding: 8px; background-color: #fee; border-left: 3px solid #e53e3e; border-radius: 4px;">
      <p style="margin: 0 0 4px 0; font-weight: 600; color: #e53e3e;">
        Tomas Clandestinas: ${value} ${unit}
      </p>
      ${data.superficie_km2 ? `
        <p style="margin: 0; font-size: 12px; color: #666;">
          Densidad: ${(value / data.superficie_km2 * 100).toFixed(2)} por 100km²
        </p>
      ` : ''}
    </div>
  `;
}

function createSocialLagContent(value: number, data: any): string {
  const quintil = data.quintil || Math.ceil(Math.abs(data.irs || 0) * 5);
  return `
    <div style="margin: 12px 0; padding: 8px; background-color: #efe; border-left: 3px solid #38a169; border-radius: 4px;">
      <p style="margin: 0 0 4px 0; font-weight: 600; color: #38a169;">
        Rezago Social: ${data.irs?.toFixed(2) || 'N/A'}
      </p>
      <p style="margin: 0; font-size: 12px; color: #666;">
        Quintil: ${quintil} (${quintil <= 2 ? 'Bajo' : quintil <= 3 ? 'Medio' : 'Alto'})
      </p>
    </div>
  `;
}

function createInstitutionalCapacityContent(value: number, unit: string, data: any): string {
  const centros = data.centros_salud || 0;
  const refugios = data.refugios || 0;
  return `
    <div style="margin: 12px 0; padding: 8px; background-color: #efe; border-left: 3px solid #38a169; border-radius: 4px;">
      <p style="margin: 0 0 4px 0; font-weight: 600; color: #38a169;">
        Capacidad Total: ${value} ${unit}
      </p>
      <div style="font-size: 11px; color: #666; margin-top: 6px;">
        <div>🏥 Centros de Salud: ${centros}</div>
        <div>🏠 Refugios: ${refugios}</div>
        <div>🏛️ Instituciones: ${data.comision_busqueda ? '✓' : '✗'} Comisión, ${data.fiscalia ? '✓' : '✗'} Fiscalía</div>
      </div>
    </div>
  `;
}

function createGenericContent(layerId: string, value: number, unit: string): string {
  return `
    <div style="margin: 12px 0; padding: 8px; background-color: #f3f4f6; border-radius: 4px;">
      <p style="margin: 0; font-weight: 600;">
        ${layerId}: ${value} ${unit}
      </p>
    </div>
  `;
}

/**
 * Creates a composite popup when multiple layers are active
 * TODO: Implement this for when multiple layers are visible
 */
export function createCompositePopup(
  properties: any, 
  activeLayerConfigs: LayerConfig[]
): string {
  // This will be implemented when we need to show data from multiple layers
  // For now, just show the first active layer
  if (activeLayerConfigs.length > 0) {
    return createLayerSpecificPopup(properties, activeLayerConfigs[0]);
  }
  
  return createNoDataPopup(properties.nombre, properties.cvegeo, 'unknown');
}
