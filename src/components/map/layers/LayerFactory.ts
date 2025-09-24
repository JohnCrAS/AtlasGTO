/**
 * Factory for creating different types of map layers
 */

import type * as L from 'leaflet';
import { GUANAJUATO_COLORS } from '@/lib/atlasConfig';
import { joinDataWithGeometries, createChoroplethMapping } from '@/lib/dataJoiner';
import { createLayerSpecificPopup } from './PopupFactory';

export interface LayerConfig {
  id: string;
  type: 'choropleth' | 'heatmap' | 'markers';
  data: any;
  colorScale: string[];
  valueExtractor: (data: any) => number;
  colorLogic: 'danger' | 'safety';
  unit?: string;
}

/**
 * Creates a choropleth layer with layer-specific styling and popups
 */
export async function createChoroplethLayer(
  LeafletLib: any,
  geoJsonData: any,
  config: LayerConfig,
  map: L.Map
): Promise<L.GeoJSON | null> {
  console.log(`🎨 Creating choropleth for ${config.id} with ${config.colorLogic} logic`);
  
  try {
    const enhancedGeoJson = joinDataWithGeometries(
      geoJsonData, 
      config.data, 
      { dataSourceName: config.id }
    );
    
    // Create color mapping based on the specific layer's logic
    const getColor = createChoroplethMapping(
      enhancedGeoJson,
      config.valueExtractor,
      config.colorScale,
      { method: 'quintiles', noDataColor: '#f5f5f5' }
    );
    
    // Debug: Show value distribution for this layer
    const values = enhancedGeoJson.features
      .filter(f => f.properties.hasData)
      .map(f => config.valueExtractor(f.properties.data))
      .sort((a, b) => a - b);
    
    console.log(`📊 ${config.id} value distribution:`, {
      min: values[0] || 0,
      max: values[values.length - 1] || 0,
      count: values.length,
      sample: values.slice(0, 5)
    });
    
    return LeafletLib.geoJSON(enhancedGeoJson, {
      style: (feature: any) => {
        const municipalityCode = feature.properties.cvegeo;
        const fillColor = getColor(municipalityCode);
        
        return {
          fillColor,
          fillOpacity: feature.properties.hasData ? 0.7 : 0.3,
          color: GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL,
          weight: 1.5,
          opacity: 0.8,
        };
      },
      onEachFeature: (feature: any, layer: any) => {
        const municipality = feature.properties;
        const popupContent = createLayerSpecificPopup(municipality, config);
        layer.bindPopup(popupContent);
        
        // Add interaction handlers
        layer.on({
          mouseover: (e: any) => {
            const targetLayer = e.target;
            targetLayer.setStyle({
              fillOpacity: 0.9,
              weight: 2.5,
              opacity: 1,
            });
            targetLayer.bringToFront();
          },
          mouseout: (e: any) => {
            e.target.setStyle({
              fillOpacity: feature.properties.hasData ? 0.7 : 0.3,
              weight: 1.5,
              opacity: 0.8,
            });
          },
          click: (e: any) => {
            map.fitBounds(e.target.getBounds(), { padding: [20, 20] });
          }
        });
      }
    });
    
  } catch (error) {
    console.error(`❌ Error creating choropleth layer ${config.id}:`, error);
    return null;
  }
}

/**
 * Creates a neutral base layer for when no data layers are active
 */
export async function createNeutralBaseLayer(
  LeafletLib: any,
  geoJsonData: any,
  map: L.Map
): Promise<L.GeoJSON> {
  const neutralLayer = LeafletLib.geoJSON(geoJsonData, {
    style: (_feature: any) => ({
      fillColor: '#e8f4f8', // Light blue-gray
      fillOpacity: 0.3,
      color: GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL,
      weight: 1.5,
      opacity: 0.8,
    }),
    onEachFeature: (feature: any, layer: any) => {
      const municipality = feature.properties;
      const popupContent = `
        <div style="font-family: system-ui; padding: 12px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: ${GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL}; font-size: 18px; font-weight: 600;">
            ${municipality.nombre || municipality.mun_name}
          </h3>
          <div style="font-size: 14px; color: #666; line-height: 1.4;">
            <p style="margin: 4px 0;"><strong>Código:</strong> ${municipality.cvegeo || 'N/A'}</p>
            <div style="margin-top: 12px; padding: 8px; background-color: #f3f4f6; border-radius: 4px;">
              <p style="margin: 0; font-size: 12px; color: #666;">
                💡 Selecciona una capa en el panel lateral para ver datos
              </p>
            </div>
          </div>
        </div>
      `;
      layer.bindPopup(popupContent);
      
      // Simple hover effect
      layer.on({
        mouseover: (e: any) => {
          e.target.setStyle({
            fillOpacity: 0.5,
            weight: 2,
          });
        },
        mouseout: (e: any) => {
          e.target.setStyle({
            fillOpacity: 0.3,
            weight: 1.5,
          });
        }
      });
    }
  });

  return neutralLayer;
}
