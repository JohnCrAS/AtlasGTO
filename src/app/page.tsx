'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Layers } from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { GUANAJUATO_COLORS } from '@/lib/atlasConfig';

// Importar el mapa dinámicamente para evitar problemas de SSR
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div>
          <p className="text-lg font-semibold text-gray-700">Cargando Atlas de Guanajuato</p>
          <p className="text-sm text-gray-500 mt-1">Preparando municipios y datos...</p>
        </div>
      </div>
    </div>
  ),
});

export default function Home() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header fijo */}
      <Header />
      
      {/* Contenido principal - full screen */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar - only visible on desktop */}
        <Sidebar 
          className="hidden md:flex" 
          isMobileOpen={false}
          onToggleMobile={() => {}}
        />
        
        {/* Mapa principal - full screen on mobile, flex-1 on desktop */}
        <div className={`flex-1 relative w-full md:w-auto transition-all duration-300 ${isMobileOpen ? 'md:ml-0' : ''}`}>
          <LeafletMap isMobileSidebarOpen={isMobileOpen} />
        </div>
      </div>

      {/* Mobile Sidebar - rendered outside the main layout to avoid overflow issues */}
      <Sidebar 
        className="md:hidden" 
        isMobileOpen={isMobileOpen}
        onToggleMobile={toggleMobileSidebar}
      />

      {/* Mobile FAB - rendered at page level to avoid z-index issues */}
      {!isMobileOpen && (
        <button
          onClick={toggleMobileSidebar}
          className="fixed bottom-6 left-6 w-16 h-16 rounded-full shadow-xl transition-all duration-300 flex flex-col items-center justify-center md:hidden border-2 border-white/20 cursor-pointer touch-manipulation"
          style={{ 
            backgroundColor: GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL,
            zIndex: 10000
          }}
        >
          <Layers className="w-6 h-6 text-white mb-1 pointer-events-none" />
          <span className="text-white text-xs font-medium pointer-events-none">Capas</span>
        </button>
      )}
    </div>
  );
}