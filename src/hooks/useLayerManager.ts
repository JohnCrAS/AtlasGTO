/**
 * React Hook for Layer Management
 * 
 * Provides reactive layer state management for Atlas components
 */

import { useState, useEffect, useCallback } from 'react';
import { layerManager, type LayerState, type LayerVisualizationType } from '@/lib/layerManager';

export interface UseLayerManagerReturn {
  // State
  layers: LayerState[];
  visibleLayers: LayerState[];
  isLoading: boolean;
  
  // Actions
  toggleLayer: (id: string) => void;
  showOnlyLayer: (id: string) => void;
  hideAllLayers: () => void;
  setLayerVisibility: (id: string, visible: boolean) => void;
  
  // Utilities
  getLayer: (id: string) => LayerState | undefined;
  getLayersByType: (type: LayerVisualizationType) => LayerState[];
  getStatistics: () => ReturnType<typeof layerManager.getStatistics>;
}

/**
 * Hook to manage layer state reactively
 */
export function useLayerManager(): UseLayerManagerReturn {
  const [layers, setLayers] = useState<LayerState[]>(() => layerManager.getLayers());
  
  // Subscribe to layer changes
  useEffect(() => {
    const unsubscribe = layerManager.subscribe((updatedLayers) => {
      setLayers(updatedLayers);
    });

    return unsubscribe;
  }, []);

  // Derived state
  const visibleLayers = layers.filter(layer => layer.isVisible);
  const isLoading = layers.some(layer => layer.isLoading);

  // Actions
  const toggleLayer = useCallback((id: string) => {
    layerManager.toggleLayer(id);
  }, []);

  const showOnlyLayer = useCallback((id: string) => {
    layerManager.showOnlyLayer(id);
  }, []);

  const hideAllLayers = useCallback(() => {
    layerManager.hideAllLayers();
  }, []);

  const setLayerVisibility = useCallback((id: string, visible: boolean) => {
    layerManager.setLayerVisibility(id, visible);
  }, []);

  // Utilities
  const getLayer = useCallback((id: string) => {
    return layerManager.getLayer(id);
  }, []);

  const getLayersByType = useCallback((type: LayerVisualizationType) => {
    return layerManager.getLayersByType(type);
  }, []);

  const getStatistics = useCallback(() => {
    return layerManager.getStatistics();
  }, []);

  return {
    // State
    layers,
    visibleLayers,
    isLoading,
    
    // Actions
    toggleLayer,
    showOnlyLayer,
    hideAllLayers,
    setLayerVisibility,
    
    // Utilities
    getLayer,
    getLayersByType,
    getStatistics,
  };
}

/**
 * Hook to manage a specific layer
 */
export function useLayer(id: string) {
  const { layers, toggleLayer, setLayerVisibility } = useLayerManager();
  
  const layer = layers.find(l => l.id === id);
  
  const toggle = useCallback(() => {
    toggleLayer(id);
  }, [id, toggleLayer]);

  const setVisible = useCallback((visible: boolean) => {
    setLayerVisibility(id, visible);
  }, [id, setLayerVisibility]);

  return {
    layer,
    isVisible: layer?.isVisible ?? false,
    isLoading: layer?.isLoading ?? false,
    hasData: layer?.hasData ?? false,
    toggle,
    setVisible,
  };
}
