/**
 * Layer Controls Component
 * 
 * Provides UI controls for toggling map layers on/off
 * Supports different visualization types with appropriate icons
 */

'use client';

import { useState } from 'react';
import { Eye, EyeOff, Map, TrendingUp, Users, Zap, Building, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useLayerManager } from '@/hooks/useLayerManager';
import { GUANAJUATO_COLORS } from '@/lib/atlasConfig';
import type { LayerState, LayerVisualizationType } from '@/lib/layerManager';

/** Props for LayerControls component */
interface LayerControlsProps {
  className?: string;
  compact?: boolean;
  searchTerm?: string;
}

/** Icon mapping for different layer types */
const LAYER_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'indice_riesgo': AlertTriangle,
  'desapariciones': Users,
  'homicidios': TrendingUp,
  'tomas_clandestinas': Zap,
  'rezago_social': Building,
  'capacidad_instalada': Building,
};

/** Color mapping for visualization types */
const VISUALIZATION_COLORS: Record<LayerVisualizationType, string> = {
  'choropleth': GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL,
  'heatmap': GUANAJUATO_COLORS.DESARROLLO_ECONOMICO,
  'markers': GUANAJUATO_COLORS.GOBIERNO_EFECTIVO,
  'none': '#666666',
};

/**
 * Individual layer control item
 */
interface LayerControlItemProps {
  layer: LayerState;
  onToggle: (id: string) => void;
  compact?: boolean;
}

function LayerControlItem({ layer, onToggle, compact = false }: LayerControlItemProps) {
  const IconComponent = LAYER_ICONS[layer.id] || Map;
  const visualColor = VISUALIZATION_COLORS[layer.visualizationType];
  
  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-lg border transition-all duration-200
      ${layer.isVisible 
        ? 'bg-gto-blue/10 border-gto-blue/30 shadow-sm' 
        : 'bg-white border-gray-200 hover:border-gto-blue/20'
      }
      ${layer.isLoading ? 'opacity-60' : ''}
      ${compact ? 'p-2' : 'p-3'}
    `}>
      {/* Layer Icon */}
      <div 
        className="flex-shrink-0 p-2 rounded-md"
        style={{ backgroundColor: `${visualColor}20`, color: visualColor }}
      >
        <IconComponent size={compact ? 16 : 20} />
      </div>
      
      {/* Layer Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={`font-medium text-gray-900 truncate ${compact ? 'text-sm' : 'text-base'}`}>
            {layer.name}
          </h4>
          {layer.isLoading && (
            <div className="w-3 h-3 border border-gto-blue border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        
        {!compact && (
          <>
            <p className="text-xs text-gray-600 mt-1 truncate">
              {layer.description}
            </p>
            
            {/* Data status */}
            <div className="flex items-center gap-2 mt-2">
              <div className={`
                px-2 py-1 rounded text-xs font-medium
                ${layer.hasData 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
                }
              `}>
                {layer.hasData ? 'Con datos' : 'Sin datos'}
              </div>
              
              {layer.dataCount && (
                <span className="text-xs text-gray-500">
                  {layer.dataCount} registros
                </span>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Toggle Button */}
      <button
        onClick={() => onToggle(layer.id)}
        disabled={layer.isLoading}
        className={`
          flex-shrink-0 p-2 rounded-md transition-colors
          ${layer.isVisible
            ? 'bg-gto-blue text-white hover:bg-gto-blue/90'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        aria-label={`${layer.isVisible ? 'Ocultar' : 'Mostrar'} capa ${layer.name}`}
      >
        {layer.isVisible ? (
          <Eye size={compact ? 14 : 16} />
        ) : (
          <EyeOff size={compact ? 14 : 16} />
        )}
      </button>
    </div>
  );
}

/**
 * Main layer controls component
 */
export default function LayerControls({ className = '', compact = false, searchTerm = '' }: LayerControlsProps) {
  const { layers, visibleLayers, toggleLayer, hideAllLayers } = useLayerManager();
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Filter layers based on search term
  const filteredLayers = layers.filter(layer => 
    layer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    layer.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const statistics = {
    total: filteredLayers.length,
    visible: visibleLayers.length,
    withData: filteredLayers.filter(l => l.hasData).length,
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gto-blue/10 rounded-lg">
            <Map className="w-5 h-5 text-gto-blue" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Capas de Información
            </h3>
            <p className="text-sm text-gray-600">
              {statistics.visible} de {statistics.total} activas
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Hide All Button */}
          {statistics.visible > 0 && (
            <button
              onClick={hideAllLayers}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Ocultar todas
            </button>
          )}
          
          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            aria-label={isExpanded ? 'Contraer' : 'Expandir'}
          >
            {isExpanded ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
        </div>
      </div>
      
      {/* Layer List */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {filteredLayers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Map className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{searchTerm ? 'No se encontraron capas' : 'No hay capas disponibles'}</p>
            </div>
          ) : (
            filteredLayers.map(layer => (
              <LayerControlItem
                key={layer.id}
                layer={layer}
                onToggle={toggleLayer}
                compact={compact}
              />
            ))
          )}
        </div>
      )}
      
      {/* Footer Statistics */}
      {isExpanded && statistics.withData > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{statistics.withData} capas con datos</span>
            <span>Última actualización: Hoy</span>
          </div>
        </div>
      )}
    </div>
  );
}
