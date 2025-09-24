'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Layers, Search } from 'lucide-react';
import { GUANAJUATO_COLORS } from '@/lib/atlasConfig';
import LayerControls from '@/components/map/LayerControls';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Sidebar */}
      <div 
        className={`
          ${isCollapsed ? 'w-12' : 'w-80'} 
          h-full bg-white shadow-xl border-r-2 transition-all duration-300 ease-in-out z-40 flex flex-col
          ${className}
        `}
        style={{ borderRightColor: GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL + '20' }}
      >
        {/* Header del sidebar */}
        <div 
          className="h-14 flex items-center justify-between px-4 border-b"
          style={{ borderBottomColor: GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL + '20' }}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Layers 
                className="w-5 h-5" 
                style={{ color: GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL }} 
              />
              <h2 
                className="font-semibold text-lg"
                style={{ color: GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL }}
              >
                Capas de información
              </h2>
            </div>
          )}
          
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL }}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Contenido del sidebar */}
        {!isCollapsed && (
          <>
            {/* Buscador */}
            <div className="p-4 border-b" style={{ borderBottomColor: GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL + '20' }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Busca una capa cartográfica"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                  style={{ 
                    '--tw-ring-color': GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL + '40',
                  } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Controles de capas */}
            <div className="flex-1 overflow-y-auto">
              <LayerControls searchTerm={searchTerm} />
            </div>

            {/* Footer del sidebar */}
            <div className="p-4 border-t" style={{ borderTopColor: GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL + '20' }}>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">
                  Atlas de Riesgos para mujeres buscadoras.
                </p>
                <p className="text-xs text-gray-400">
                  Criterios de residencia, búsqueda,actividades y capacidades instaladas del Estado de Guanajuato
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
