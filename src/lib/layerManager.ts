/**
 * Layer Management System for Atlas de Riesgo
 * 
 * Manages multiple data layers with different visualization types:
 * - Choropleth: Risk index, social lag
 * - Heat maps: Disappearances, homicides, clandestine taps
 * - Markers: Institutional capacity
 */

import { ATLAS_LAYERS } from './atlasConfig';
import type { AtlasLayerConfig } from './atlasConfig';

/** Available visualization types */
export type LayerVisualizationType = 'choropleth' | 'heatmap' | 'markers' | 'none';

/** Layer state for UI management */
export interface LayerState {
  id: string;
  name: string;
  description: string;
  isVisible: boolean;
  isLoading: boolean;
  hasData: boolean;
  visualizationType: LayerVisualizationType;
  config: AtlasLayerConfig;
  dataCount?: number;
  lastUpdated?: Date;
}

/** Layer manager class */
export class AtlasLayerManager {
  private layers: Map<string, LayerState> = new Map();
  private listeners: Set<(layers: LayerState[]) => void> = new Set();

  constructor() {
    this.initializeLayers();
  }

  /**
   * Initialize all layers from configuration
   */
  private initializeLayers(): void {
    Object.entries(ATLAS_LAYERS).forEach(([id, config]) => {
      const visualizationType = this.determineVisualizationType(config);
      
      const layerState: LayerState = {
        id,
        name: config.name,
        description: config.description,
        isVisible: id === 'indice_riesgo', // Only risk index visible by default
        isLoading: false,
        hasData: false,
        visualizationType,
        config,
      };

      this.layers.set(id, layerState);
    });

    console.log(`🗂️ Initialized ${this.layers.size} layers`);
  }

  /**
   * Determine visualization type based on layer configuration
   */
  private determineVisualizationType(config: AtlasLayerConfig): LayerVisualizationType {
    // Based on your PLAN_MVP.md specifications
    switch (config.id) {
      case 'indice_riesgo':
      case 'rezago_social':
        return 'choropleth';
      
      case 'desapariciones':
      case 'homicidios':
      case 'tomas_clandestinas':
        return 'heatmap';
      
      case 'capacidad_instalada':
        return 'markers';
      
      default:
        return 'choropleth'; // Default fallback
    }
  }

  /**
   * Get all layer states
   */
  getLayers(): LayerState[] {
    return Array.from(this.layers.values());
  }

  /**
   * Get visible layers only
   */
  getVisibleLayers(): LayerState[] {
    return this.getLayers().filter(layer => layer.isVisible);
  }

  /**
   * Get layer by ID
   */
  getLayer(id: string): LayerState | undefined {
    return this.layers.get(id);
  }

  /**
   * Toggle layer visibility
   */
  toggleLayer(id: string): boolean {
    const layer = this.layers.get(id);
    if (!layer) {
      console.warn(`⚠️ Layer not found: ${id}`);
      return false;
    }

    layer.isVisible = !layer.isVisible;
    console.log(`👁️ ${layer.isVisible ? 'Showing' : 'Hiding'} layer: ${layer.name}`);
    
    this.notifyListeners();
    return layer.isVisible;
  }

  /**
   * Set layer visibility
   */
  setLayerVisibility(id: string, visible: boolean): boolean {
    const layer = this.layers.get(id);
    if (!layer) {
      console.warn(`⚠️ Layer not found: ${id}`);
      return false;
    }

    if (layer.isVisible !== visible) {
      layer.isVisible = visible;
      console.log(`👁️ ${visible ? 'Showing' : 'Hiding'} layer: ${layer.name}`);
      this.notifyListeners();
    }
    
    return true;
  }

  /**
   * Set layer loading state
   */
  setLayerLoading(id: string, loading: boolean): void {
    const layer = this.layers.get(id);
    if (!layer) return;

    layer.isLoading = loading;
    this.notifyListeners();
  }

  /**
   * Set layer data state
   */
  setLayerData(id: string, hasData: boolean, dataCount?: number): void {
    const layer = this.layers.get(id);
    if (!layer) {
      console.warn(`⚠️ LayerManager: Layer not found for setLayerData: ${id}`);
      return;
    }

    console.log(`📊 LayerManager: Updating layer data for ${id}:`, {
      hasData,
      dataCount,
      layerName: layer.name
    });

    layer.hasData = hasData;
    layer.dataCount = dataCount;
    layer.lastUpdated = new Date();
    this.notifyListeners();
    
    console.log(`✅ LayerManager: Layer ${id} updated, notifying listeners`);
  }

  /**
   * Show only one layer (hide all others)
   */
  showOnlyLayer(id: string): void {
    this.layers.forEach((layer, layerId) => {
      layer.isVisible = layerId === id;
    });
    
    const targetLayer = this.layers.get(id);
    console.log(`🎯 Showing only layer: ${targetLayer?.name || id}`);
    
    this.notifyListeners();
  }

  /**
   * Hide all layers
   */
  hideAllLayers(): void {
    this.layers.forEach(layer => {
      layer.isVisible = false;
    });
    
    console.log('🙈 All layers hidden');
    this.notifyListeners();
  }

  /**
   * Get layers by visualization type
   */
  getLayersByType(type: LayerVisualizationType): LayerState[] {
    return this.getLayers().filter(layer => layer.visualizationType === type);
  }

  /**
   * Get layer statistics
   */
  getStatistics(): {
    total: number;
    visible: number;
    withData: number;
    loading: number;
    byType: Record<LayerVisualizationType, number>;
  } {
    const layers = this.getLayers();
    
    const byType: Record<LayerVisualizationType, number> = {
      choropleth: 0,
      heatmap: 0,
      markers: 0,
      none: 0,
    };

    layers.forEach(layer => {
      byType[layer.visualizationType]++;
    });

    return {
      total: layers.length,
      visible: layers.filter(l => l.isVisible).length,
      withData: layers.filter(l => l.hasData).length,
      loading: layers.filter(l => l.isLoading).length,
      byType,
    };
  }

  /**
   * Subscribe to layer changes
   */
  subscribe(listener: (layers: LayerState[]) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of layer changes
   */
  private notifyListeners(): void {
    const layers = this.getLayers();
    this.listeners.forEach(listener => listener(layers));
  }

  /**
   * Reset all layers to default state
   */
  reset(): void {
    this.layers.forEach(layer => {
      layer.isVisible = layer.id === 'indice_riesgo'; // Only risk index visible
      layer.isLoading = false;
      layer.hasData = false;
      layer.dataCount = undefined;
      layer.lastUpdated = undefined;
    });

    console.log('🔄 Layers reset to default state');
    this.notifyListeners();
  }
}

// Export singleton instance
export const layerManager = new AtlasLayerManager();
