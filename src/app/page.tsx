'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

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
  return (
    <div className="h-full flex flex-col">
      {/* Header fijo */}
      <Header />
      
      {/* Contenido principal - full screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar colapsible */}
        <Sidebar />
        
        {/* Mapa principal - full screen */}
        <div className="flex-1 relative">
          <LeafletMap />
        </div>
      </div>
    </div>
  );
}