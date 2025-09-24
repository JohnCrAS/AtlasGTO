'use client';

import Image from 'next/image';
import { GUANAJUATO_COLORS } from '@/lib/atlasConfig';

/**
 * Gets the correct path for static assets based on the environment
 */
function getAssetPath(path: string): string {
  // In production (GitHub Pages), we need to include the repository name
  if (process.env.NODE_ENV === 'production') {
    return `/AtlasGTO${path}`;
  }
  // In development, no base path needed
  return path;
}

export default function Header() {
  return (
    <header 
      className="h-16 w-full flex shadow-lg border-b-2 z-50 relative"
      style={{ 
        borderBottomColor: GUANAJUATO_COLORS.DESARROLLO_ECONOMICO,
        background: `linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.3) 35%, rgba(255,255,255,0.1) 40%, ${GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL} 45%)`
      }}
    >
      {/* Columna 1: Logo con fondo degradado sutil */}
      <div className="flex items-center px-3 md:px-6 flex-shrink-0 relative">
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-r-lg"></div>
        <Image
          src={getAssetPath("/logo.png")}
          alt="Gobierno del Estado de Guanajuato"
          width={120}
          height={32}
          className="object-contain relative z-10 drop-shadow-sm md:w-[185px] md:h-[48px]"
        />
      </div>
      
      {/* Columna 2: Resto del header con fondo azul */}
      <div 
        className="flex-1 flex items-center justify-between px-2 md:px-6"
        style={{ backgroundColor: GUANAJUATO_COLORS.SEGURIDAD_PAZ_SOCIAL }}
      >
        {/* Título del Atlas */}
        <div className="flex items-center min-w-0 flex-1">
          <div className="border-l border-white/30 pl-2 md:pl-4 ml-1 md:ml-2">
            <h1 className="text-white font-bold text-sm md:text-lg leading-tight drop-shadow-sm truncate">
              Atlas de Riesgo
            </h1>
            <p className="text-white/90 text-xs md:text-sm font-medium truncate">
              Mujeres Buscadoras
            </p>
          </div>
        </div>

        {/* Navegación central */}
        <nav className="hidden md:flex items-center gap-6">
          <button 
            className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded text-sm font-medium transition-all duration-200"
            onClick={() => window.location.reload()}
          >
            Atlas Principal
          </button>
          <button 
            className="text-white/60 cursor-not-allowed px-3 py-1.5 rounded text-sm font-medium"
            disabled
          >
            Metodología
          </button>
          <button 
            className="text-white/60 cursor-not-allowed px-3 py-1.5 rounded text-sm font-medium"
            disabled
          >
            Datos Abiertos
          </button>
        </nav>

        {/* Información del gobierno */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="text-right">
            <p className="text-white text-xs font-medium drop-shadow-sm">
              GOBIERNO DEL ESTADO
            </p>
            <p className="text-white/90 text-xs">
              DE GUANAJUATO
            </p>
          </div>
          <div 
            className="w-px h-8 bg-white/30"
          />
          <div className="text-right">
            <p className="text-white text-xs font-medium drop-shadow-sm">
              SECRETARÍA DE GOBIERNO
            </p>
          </div>
        </div>

        {/* Mobile info - show municipality count */}
        <div className="md:hidden text-right">
          <p className="text-white text-xs font-medium drop-shadow-sm">
            46 municipios
          </p>
          <p className="text-white/90 text-xs">
            6/6 con datos
          </p>
        </div>
      </div>
    </header>
  );
}