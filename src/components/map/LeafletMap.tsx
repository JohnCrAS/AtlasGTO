'use client';

import { useEffect, useRef, useState } from 'react';
import type * as L from 'leaflet';
import { MAP_CONFIG, GUANAJUATO_COLORS } from '@/lib/atlasConfig';
import { loadMunicipalitiesGeoJSON } from '@/lib/geoUtils';
import { loadAllAtlasData } from '@/lib/dataLoader';
import { useLayerManager } from '@/hooks/useLayerManager';
import { layerManager } from '@/lib/layerManager';
import { createLayerConfigs } from './layers/LayerConfigs';
import { createChoroplethLayer, createNeutralBaseLayer } from './layers/LayerFactory';

/**
 * Componente base del mapa Leaflet
 * 
 * Renderiza un mapa centrado en Guanajuato con:
 * - OpenStreetMap como base
 * - Configuración desde atlasConfig.ts
 * - Preparado para capas de datos
 */
interface LeafletMapProps {
  isMobileSidebarOpen?: boolean;
}

export default function LeafletMap({ isMobileSidebarOpen = false }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<Map<string, L.Layer>>(new Map());
  
  // Estado para tracking de carga
  const [isLoadingGeoJSON, setIsLoadingGeoJSON] = useState(true);
  const [municipalitiesCount, setMunicipalitiesCount] = useState(0);
  const [dataStatus, setDataStatus] = useState<{
    loaded: boolean;
    withData: number;
    total: number;
  }>({ loaded: false, withData: 0, total: 0 });

  // Use layer manager
  const { visibleLayers } = useLayerManager();

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Función para cargar y mostrar todas las capas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loadAllLayers = async (map: L.Map, LeafletLib: any) => {
      try {
        setIsLoadingGeoJSON(true);
        
        // Cargar GeoJSON y todos los datos en paralelo
        console.log('🔄 Starting to load GeoJSON and all layer data...');
        const [geoJsonData, allLayerData] = await Promise.all([
          loadMunicipalitiesGeoJSON(),
          loadAllAtlasData()
        ]);
        
        console.log('📊 Loaded layer data keys:', Array.from(allLayerData.keys()));
        console.log('📋 Layer data sizes:', 
          Array.from(allLayerData.entries()).map(([key, data]) => 
            `${key}: ${data?.records?.length || 0} records`
          )
        );
        
        // Debug: Check if specific layers are loaded
        const testLayers = ['indice_riesgo', 'desapariciones', 'homicidios', 'rezago_social'];
        testLayers.forEach(layerId => {
          const data = allLayerData.get(layerId);
          console.log(`🔍 Layer ${layerId}:`, {
            exists: !!data,
            records: data?.records?.length || 0,
            sample: data?.records?.[0] || null
          });
        });
        
        setMunicipalitiesCount(geoJsonData.features.length);
        
        // Wait for map to be fully ready before adding layers
        await new Promise(resolve => {
          if (map.getContainer()) {
            resolve(undefined);
          } else {
            map.whenReady(() => resolve(undefined));
          }
        });
        
        // Crear capa base neutral (sin datos)
        const neutralLayer = await createNeutralBaseLayer(LeafletLib, geoJsonData, map);
        
        if (neutralLayer && map) {
          neutralLayer.addTo(map);
          layersRef.current.set('_neutral_base', neutralLayer);
        }
        
        // Fit map to bounds
        if (neutralLayer) {
          map.fitBounds(neutralLayer.getBounds(), { padding: [10, 10] });
        }
        
        // Crear todas las capas de datos
        await createAllDataLayers(map, LeafletLib, geoJsonData, allLayerData);
        
        console.log(`✅ Todas las capas cargadas: ${geoJsonData.features.length} municipios`);
        
      } catch (error) {
        console.error('❌ Error cargando capas:', error);
      } finally {
        setIsLoadingGeoJSON(false);
      }
    };

    // Función para crear todas las capas de datos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createAllDataLayers = async (map: L.Map, LeafletLib: any, geoJsonData: any, allData: Map<string, any>) => {
      // Extract records from DataFile objects for layer configs
      const recordsMap = new Map();
      allData.forEach((dataFile, key) => {
        if (dataFile && dataFile.records) {
          recordsMap.set(key, dataFile.records);
        }
      });
      
      const layerConfigs = createLayerConfigs(recordsMap);

      for (const config of layerConfigs) {
        if (!config.data) {
          console.warn(`⚠️ No data found for layer: ${config.id}`);
          console.warn(`   Available data keys:`, Array.from(allData.keys()));
          continue;
        }
        
        console.log(`🔍 Processing layer ${config.id}:`, {
          hasData: !!config.data,
          recordCount: config.data?.length || 0,
          dataKeys: config.data ? Object.keys(config.data[0] || {}) : []
        });

        const layer = await createChoroplethLayer(LeafletLib, geoJsonData, config, map);

        if (layer) {
          layersRef.current.set(config.id, layer);
          
          // Update layer manager with data info
          const recordCount = config.data?.length || 0;
          layerManager.setLayerData(config.id, true, recordCount);
          
          console.log(`✅ Layer created: ${config.id} (${recordCount} records)`);
          console.log(`📊 Layer manager updated for ${config.id}`);
        } else {
          console.error(`❌ Failed to create layer: ${config.id}`);
        }
      }

      // Hide neutral base layer and show default layer
      const neutralLayer = layersRef.current.get('_neutral_base');
      const defaultLayer = layersRef.current.get('indice_riesgo');
      
      if (neutralLayer && defaultLayer) {
        try {
          map.removeLayer(neutralLayer); // Hide neutral layer
          defaultLayer.addTo(map); // Show risk index layer
          console.log('✅ Default layer (indice_riesgo) added to map');
        } catch (error) {
          console.error('❌ Error switching to default layer:', error);
        }
      }

      setDataStatus({
        loaded: true,
        withData: allData.size,
        total: layerConfigs.length
      });
    };




    // Importar Leaflet dinámicamente
    const initMap = async () => {
      try {
        // Importar Leaflet
        const L = (await import('leaflet')).default;

        // Limpiar mapa existente si existe
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
        }

        // Crear el mapa
        const map = L.map(mapRef.current!, {
          center: MAP_CONFIG.center,
          zoom: MAP_CONFIG.zoom,
          minZoom: MAP_CONFIG.minZoom,
          maxZoom: MAP_CONFIG.maxZoom,
          maxBounds: MAP_CONFIG.bounds,
          zoomControl: true,
          attributionControl: true,
        });

        // Añadir capa base de tiles
        L.tileLayer(MAP_CONFIG.tileLayer.url, {
          attribution: MAP_CONFIG.tileLayer.attribution,
          maxZoom: MAP_CONFIG.tileLayer.maxZoom,
        }).addTo(map);

        // Test markers removed - data layers will provide all necessary information

        // Guardar referencia del mapa
        leafletMapRef.current = map;

        // Cargar y mostrar todas las capas
        await loadAllLayers(map, L);

        console.log('✅ Mapa Leaflet inicializado correctamente');
        console.log('📍 Centro:', MAP_CONFIG.center);
        console.log('🎨 Colores oficiales cargados');

      } catch (error) {
        console.error('❌ Error inicializando el mapa:', error);
      }
    };

    initMap();

    // Capture the current ref value for cleanup
    const currentLayersRef = layersRef.current;

    // Cleanup al desmontar
    return () => {
      // Clean up all layers
      currentLayersRef.forEach(layer => {
        layer.remove();
      });
      currentLayersRef.clear();
      
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Effect to handle layer visibility changes
  useEffect(() => {
    if (!leafletMapRef.current) return;

    const map = leafletMapRef.current;
    const neutralLayer = layersRef.current.get('_neutral_base');

    // Check if any data layers are visible
    const hasVisibleDataLayers = visibleLayers.length > 0;

    // Show/hide neutral base layer
    if (neutralLayer) {
      if (!hasVisibleDataLayers && !map.hasLayer(neutralLayer)) {
        map.addLayer(neutralLayer);
        console.log('👁️ Showing neutral base layer');
      } else if (hasVisibleDataLayers && map.hasLayer(neutralLayer)) {
        map.removeLayer(neutralLayer);
        console.log('🙈 Hiding neutral base layer');
      }
    }

    // Update data layer visibility
    layersRef.current.forEach((layer, layerId) => {
      // Skip neutral base layer
      if (layerId === '_neutral_base') return;
      
      const shouldBeVisible = visibleLayers.some(vl => vl.id === layerId);
      
      if (shouldBeVisible && !map.hasLayer(layer)) {
        map.addLayer(layer);
        console.log(`👁️ Showing layer: ${layerId}`);
      } else if (!shouldBeVisible && map.hasLayer(layer)) {
        map.removeLayer(layer);
        console.log(`🙈 Hiding layer: ${layerId}`);
      }
    });
  }, [visibleLayers]);


  return (
    <div className={`relative w-full h-full transition-transform duration-300 md:transform-none ${isMobileSidebarOpen ? 'transform translate-x-80' : 'transform translate-x-0'}`}>
      {/* Contenedor del mapa */}
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ 
          minHeight: '100vh'
        }}
      />
      
      {/* Indicador de carga */}
      {isLoadingGeoJSON && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-lg z-[1000]">
          <div className="text-center space-y-4">
            <div 
              className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin mx-auto"
              style={{ borderColor: GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL }}
            ></div>
            <div>
              <p className="text-base font-semibold" style={{ color: GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL }}>
                Cargando Atlas de Guanajuato
              </p>
              <p className="text-sm text-foreground/70 mt-1">
                Municipios y geometrías...
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Indicador de estado en la esquina */}
      {!isLoadingGeoJSON && municipalitiesCount > 0 && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-gto-blue/20 z-[1000]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-gto-green rounded-full"></div>
              <span className="font-medium text-gto-blue">
                {municipalitiesCount} municipios
              </span>
            </div>
            {dataStatus.loaded && (
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-gto-orange rounded-full"></div>
                <span className="text-gto-blue/70">
                  {dataStatus.withData}/{dataStatus.total} con datos
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
