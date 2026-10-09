import React from 'react';

export type ToolType = 'brocha' | 'rodillo' | 'cinta' | 'espatula' | 'bandeja' | 'extension';

interface ToolGraphicProps {
  toolType?: ToolType | string;
  productName?: string;
  className?: string;
  sizeLabel?: string;
  subType?: '3pulg' | '4pulg' | 'angular' | 'microfibra' | 'espuma';
}

export const ToolGraphic: React.FC<ToolGraphicProps> = ({
  toolType = 'brocha',
  productName = 'Brocha Profesional para Paredes',
  className = 'w-32 h-40',
  sizeLabel = '3"',
  subType
}) => {
  // Infer tool type from productName if not strictly provided
  // El nombre del producto manda; el tipo recibido solo se usa si el nombre no lo dice
  const normalized = (productName + ' ' + String(toolType)).toLowerCase();
  
  let resolvedType: ToolType = 'brocha';
  const nameOnly = productName.toLowerCase();
  if (/esp[aá]tula|rasqueta/.test(nameOnly)) resolvedType = 'espatula';
  else if (/cinta|enmascarar|masking/.test(nameOnly)) resolvedType = 'cinta';
  else if (/bandeja|cubeta/.test(nameOnly)) resolvedType = 'bandeja';
  else if (/extensi[oó]n|telesc[oó]pica/.test(nameOnly)) resolvedType = 'extension';
  else if (normalized.includes('rodillo')) resolvedType = 'rodillo';
  else if (normalized.includes('brocha') || normalized.includes('pincel')) resolvedType = 'brocha';
  else if (normalized.includes('cinta') || normalized.includes('enmascarar') || normalized.includes('masking')) resolvedType = 'cinta';
  else if (normalized.includes('espatula') || normalized.includes('espátula') || normalized.includes('rasqueta')) resolvedType = 'espatula';
  else if (normalized.includes('bandeja') || normalized.includes('cubeta')) resolvedType = 'bandeja';
  else if (normalized.includes('extension') || normalized.includes('extensión') || normalized.includes('telescopica') || normalized.includes('telescópica') || normalized.includes('varilla')) resolvedType = 'extension';

  // Foto real de la herramienta (public/products/tool-*.webp)
  const photo = (() => {
    if (normalized.includes('angular')) return 'brocha-angular';
    switch (resolvedType) {
      case 'brocha': return /\b4\b|4"|4 pulg|maestra|ancha/.test(normalized) ? 'brocha-4' : 'brocha-3';
      case 'rodillo': return /mini|espuma|4"|4 pulg/.test(normalized) ? 'mini-rodillo' : 'rodillo-9';
      case 'cinta': return 'cinta';
      case 'espatula': return 'espatula';
      case 'bandeja': return 'bandeja';
      case 'extension': return 'extension';
      default: return null;
    }
  })();
  if (photo) {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <div className="h-full max-w-full aspect-square bg-white rounded-2xl overflow-hidden">
          <img
            src={`/products/tool-${photo}.webp`}
            srcSet={`/products/tool-${photo}-sm.webp 320w, /products/tool-${photo}.webp 900w`}
            sizes="(min-width: 1024px) 420px, 240px"
            alt={productName}
            loading="lazy"
            draggable={false}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 1. BROCHA CLÁSICA PROFESIONAL PARA PINTAR PAREDES
  // (Mango de madera ergonómico, virola de acero inoxidable remachada,
  // cerdas rubias naturales densas con corte parejo para recortar muros)
  // -------------------------------------------------------------------------
  if (resolvedType === 'brocha') {
    const isAngular = normalized.includes('angular') || subType === 'angular';
    const isWide = normalized.includes('4') || subType === '4pulg';

    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg 
          viewBox="0 0 160 250" 
          className="w-full h-full drop-shadow-xl filter"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Madera barnizada natural para el mango */}
            <linearGradient id="woodHandle" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5A2B" />
              <stop offset="18%" stopColor="#C68B59" />
              <stop offset="50%" stopColor="#E2A76F" />
              <stop offset="82%" stopColor="#C68B59" />
              <stop offset="100%" stopColor="#704214" />
            </linearGradient>

            {/* Veta sutil de madera */}
            <linearGradient id="woodGrain" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.08" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
            </linearGradient>

            {/* Acero inoxidable niquelado de la virola */}
            <linearGradient id="metalFerrule" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="20%" stopColor="#94A3B8" />
              <stop offset="45%" stopColor="#F1F5F9" />
              <stop offset="60%" stopColor="#CBD5E1" />
              <stop offset="85%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            {/* Cerdas naturales rubias vulcanizadas de brocha para pared */}
            <linearGradient id="bristlesNatural" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B48B57" />
              <stop offset="25%" stopColor="#E6C894" />
              <stop offset="50%" stopColor="#F7E4BE" />
              <stop offset="75%" stopColor="#E1BD86" />
              <stop offset="100%" stopColor="#9E7643" />
            </linearGradient>

            {/* Sombra de cerdas */}
            <linearGradient id="bristlesShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3E2723" stopOpacity="0.45" />
              <stop offset="25%" stopColor="#000000" stopOpacity="0.05" />
              <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
            </linearGradient>

            {/* Relieve de remache */}
            <radialGradient id="rivet" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#1E293B" />
            </radialGradient>
          </defs>

          {/* Sombra proyectada en la base */}
          <ellipse cx="80" cy="236" rx="42" ry="7" fill="#0F172A" opacity="0.22" filter="blur(3px)" />

          {/* 1. MANGO DE MADERA ERGONÓMICO */}
          {/* Cabo superior estilizado con orificio de colgar */}
          <path
            d="M 72,15 
               C 72,10 88,10 88,15 
               L 89,50 
               C 91,70 95,95 93,120 
               L 67,120 
               C 65,95 69,70 71,50 
               Z"
            fill="url(#woodHandle)"
          />
          <path
            d="M 72,15 C 72,10 88,10 88,15 L 89,50 C 91,70 95,95 93,120 L 67,120 C 65,95 69,70 71,50 Z"
            fill="url(#woodGrain)"
          />

          {/* Agujero para colgar la brocha */}
          <circle cx="80" cy="25" r="4.5" fill="#3E2723" />
          <circle cx="80" cy="25" r="3.5" fill="#1E293B" />
          <circle cx="80" cy="24.5" r="3.2" fill="#0F172A" />

          {/* Marca grabada al fuego en el mango: COLORLINK */}
          <text x="80" y="85" fill="#451A03" opacity="0.65" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" transform="rotate(-90 80 85)" letterSpacing="1">
            COLORLINK PRO
          </text>

          {/* 2. VIROLA METÁLICA (Acero Inoxidable con remaches) */}
          <rect 
            x={isWide ? 40 : 46} 
            y="118" 
            width={isWide ? 80 : 68} 
            height="36" 
            rx="2.5" 
            fill="url(#metalFerrule)" 
          />

          {/* Ranuras de presión mecánicas en la virola */}
          <line x1={isWide ? 40 : 46} y1="126" x2={isWide ? 120 : 114} y2="126" stroke="#334155" strokeWidth="1" opacity="0.7" />
          <line x1={isWide ? 40 : 46} y1="127" x2={isWide ? 120 : 114} y2="127" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.8" />
          <line x1={isWide ? 40 : 46} y1="144" x2={isWide ? 120 : 114} y2="144" stroke="#334155" strokeWidth="1" opacity="0.7" />
          <line x1={isWide ? 40 : 46} y1="145" x2={isWide ? 120 : 114} y2="145" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.8" />

          {/* Remaches de acero de la virola */}
          <circle cx={isWide ? 54 : 58} cy="135" r="2.8" fill="url(#rivet)" />
          <circle cx={isWide ? 106 : 102} cy="135" r="2.8" fill="url(#rivet)" />
          {isWide && <circle cx="80" cy="135" r="2.8" fill="url(#rivet)" />}

          {/* 3. CERDAS DENSAS VULCANIZADAS PARA PARED */}
          {/* Cuerpo principal de cerdas */}
          {isAngular ? (
            /* Corte angular de precisión para recorte de techos y zócalos */
            <path
              d={`M ${isWide ? 42 : 48},154 
                 L ${isWide ? 118 : 112},154 
                 L ${isWide ? 122 : 116},210 
                 L ${isWide ? 38 : 44},234 
                 Z`}
              fill="url(#bristlesNatural)"
            />
          ) : (
            /* Corte recto clásico de brocha para pared de 3 o 4 pulgadas */
            <path
              d={`M ${isWide ? 42 : 48},154 
                 L ${isWide ? 118 : 112},154 
                 C ${isWide ? 122 : 116},175 ${isWide ? 124 : 117},205 ${isWide ? 121 : 115},230 
                 L ${isWide ? 39 : 45},230 
                 C ${isWide ? 36 : 43},205 ${isWide ? 38 : 44},175 ${isWide ? 42 : 48},154 
                 Z`}
              fill="url(#bristlesNatural)"
            />
          )}

          {/* Capa de sombra interna y textura */}
          {isAngular ? (
            <path
              d={`M ${isWide ? 42 : 48},154 L ${isWide ? 118 : 112},154 L ${isWide ? 122 : 116},210 L ${isWide ? 38 : 44},234 Z`}
              fill="url(#bristlesShadow)"
            />
          ) : (
            <path
              d={`M ${isWide ? 42 : 48},154 L ${isWide ? 118 : 112},154 C ${isWide ? 122 : 116},175 ${isWide ? 124 : 117},205 ${isWide ? 121 : 115},230 L ${isWide ? 39 : 45},230 C ${isWide ? 36 : 43},205 ${isWide ? 38 : 44},175 ${isWide ? 42 : 48},154 Z`}
              fill="url(#bristlesShadow)"
            />
          )}

          {/* Textura de mechones finos individuales de cerda rubia */}
          <g stroke="#92622A" strokeWidth="0.6" opacity="0.45">
            <line x1="55" y1="156" x2="52" y2="228" />
            <line x1="62" y1="156" x2="60" y2="230" />
            <line x1="70" y1="156" x2="69" y2="229" />
            <line x1="78" y1="156" x2="78" y2="230" />
            <line x1="86" y1="156" x2="87" y2="230" />
            <line x1="94" y1="156" x2="96" y2="229" />
            <line x1="102" y1="156" x2="104" y2="228" />
            {isWide && (
              <>
                <line x1="48" y1="156" x2="45" y2="228" />
                <line x1="110" y1="156" x2="114" y2="228" />
              </>
            )}
          </g>

          {/* Puntas abiertas (flagged tips) en la base inferior */}
          <g stroke="#FDF0D5" strokeWidth="0.8" opacity="0.85">
            <line x1="50" y1="225" x2="48" y2="230" />
            <line x1="60" y1="223" x2="59" y2="231" />
            <line x1="72" y1="224" x2="72" y2="230" />
            <line x1="84" y1="224" x2="85" y2="231" />
            <line x1="98" y1="223" x2="99" y2="230" />
            <line x1="108" y1="224" x2="111" y2="230" />
          </g>
        </svg>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 2. RODILLO ANTIGOTEO PROFESIONAL PARA PARED 9"
  // (Manilar de acero zincado 6mm, mango ergonómico con rosca para extensión,
  // felpa de microfibra de alta densidad con franjas azules de pintor)
  // -------------------------------------------------------------------------
  if (resolvedType === 'rodillo') {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg 
          viewBox="0 0 160 250" 
          className="w-full h-full drop-shadow-xl filter"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Manilar de acero zincado pulido */}
            <linearGradient id="metalArm" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="30%" stopColor="#CBD5E1" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="80%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            {/* Mango ergonómico de goma y polipropileno azul/negro */}
            <linearGradient id="rollerHandle" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0B1E48" />
              <stop offset="35%" stopColor="#1E3A8A" />
              <stop offset="60%" stopColor="#2563EB" />
              <stop offset="85%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#0B1E48" />
            </linearGradient>

            {/* Grip antideslizante de goma negra */}
            <linearGradient id="rubberGrip" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            {/* Cilindro de felpa de microfibra (fondo blanco afelpado) */}
            <linearGradient id="rollerPlush" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="25%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor="#F8FAFC" />
              <stop offset="85%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
          </defs>

          {/* Sombra proyectada */}
          <ellipse cx="80" cy="236" rx="55" ry="8" fill="#0F172A" opacity="0.2" filter="blur(4px)" />

          {/* 1. CILINDRO DE FELPA DE MICROFIBRA (HORIZONTAL ARRIBA) */}
          {/* Tapa plástica lateral izquierda */}
          <rect x="18" y="24" width="7" height="64" rx="3.5" fill="#0B1E48" />
          <circle cx="21" cy="56" r="3" fill="#94A3B8" />

          {/* Cilindro esponjoso de felpa de microfibra de 9" */}
          <rect x="25" y="22" width="112" height="68" rx="8" fill="url(#rollerPlush)" />

          {/* Franjas diagonales azules de microfibra antigoteo (diseño profesional) */}
          <g opacity="0.85">
            <path d="M 35,22 L 52,22 L 30,90 L 25,90 Z" fill="#2563EB" />
            <path d="M 62,22 L 79,22 L 48,90 L 31,90 Z" fill="#2563EB" />
            <path d="M 89,22 L 106,22 L 75,90 L 58,90 Z" fill="#2563EB" />
            <path d="M 116,22 L 133,22 L 102,90 L 85,90 Z" fill="#2563EB" />
            <path d="M 137,35 L 137,60 L 129,90 L 112,90 Z" fill="#2563EB" />
          </g>

          {/* Sombra curva cilíndrica del rodillo */}
          <rect x="25" y="22" width="112" height="68" rx="8" fill="url(#rollerPlush)" opacity="0.28" />

          {/* Brillo especular superior del cilindro */}
          <rect x="27" y="26" width="108" height="8" rx="4" fill="#FFFFFF" opacity="0.75" />

          {/* Tapa plástica lateral derecha */}
          <rect x="137" y="24" width="6" height="64" rx="3" fill="#0B1E48" />

          {/* 2. MANILAR DE ACERO ZINCADO (Varilla de 6 mm en ángulo) */}
          {/* Varilla que entra al eje del rodillo por la derecha */}
          <path
            d="M 141,56 
               L 148,56 
               C 152,56 153,60 153,65 
               L 153,120 
               C 153,126 148,131 142,131 
               L 85,131 
               C 81,131 78,134 78,139 
               L 78,155"
            fill="none"
            stroke="url(#metalArm)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 3. MANGO ERGONÓMICO CON GRIP ANTIDESLIZANTE */}
          {/* Base del mango */}
          <path
            d="M 68,155 
               C 68,150 88,150 88,155 
               L 90,215 
               C 90,225 66,225 66,215 
               Z"
            fill="url(#rollerHandle)"
          />

          {/* Ranuras ergonómicas antideslizantes de goma en el mango */}
          <rect x="68" y="165" width="20" height="4" rx="2" fill="url(#rubberGrip)" />
          <rect x="67.5" y="173" width="21" height="4" rx="2" fill="url(#rubberGrip)" />
          <rect x="67" y="181" width="22" height="4" rx="2" fill="url(#rubberGrip)" />
          <rect x="67.5" y="189" width="21" height="4" rx="2" fill="url(#rubberGrip)" />
          <rect x="68" y="197" width="20" height="4" rx="2" fill="url(#rubberGrip)" />

          {/* Rosca interior para varilla de extensión en la base */}
          <rect x="71" y="218" width="14" height="12" rx="2" fill="#0B1E48" />
          <ellipse cx="78" cy="229" rx="6" ry="2" fill="#334155" />

          {/* Badge de especificación */}
        </svg>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 3. CINTA AZUL DE PINTOR (MASKING TAPE UV 14 DÍAS)
  // (Rollo de papel crepé azul con adhesivo de borde nítido para zócalos)
  // -------------------------------------------------------------------------
  if (resolvedType === 'cinta') {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg 
          viewBox="0 0 160 250" 
          className="w-full h-full drop-shadow-xl filter"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Azul brillante característico del masking tape de pintor profesional */}
            <linearGradient id="tapeBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="40%" stopColor="#1D4ED8" />
              <stop offset="80%" stopColor="#1E40AF" />
              <stop offset="100%" stopColor="#172554" />
            </linearGradient>

            {/* Núcleo de cartón interior */}
            <linearGradient id="cardboardCore" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D4A373" />
              <stop offset="50%" stopColor="#E9EDC9" />
              <stop offset="100%" stopColor="#BC6C25" />
            </linearGradient>
          </defs>

          {/* Sombra base en perspectiva */}
          <ellipse cx="80" cy="215" rx="62" ry="16" fill="#0F172A" opacity="0.25" filter="blur(4px)" />

          {/* ROLLO DE CINTA EN PERSPECTIVA ISOMÉTRICA */}
          {/* Cilindro exterior azul */}
          <path
            d="M 22,120 
               C 22,90 138,90 138,120 
               L 138,175 
               C 138,205 22,205 22,175 
               Z"
            fill="url(#tapeBlue)"
          />

          {/* Cara superior del rollo (espiral de vueltas de cinta) */}
          <ellipse cx="80" cy="120" rx="58" ry="24" fill="#2563EB" />
          <ellipse cx="80" cy="120" rx="55" ry="22.5" fill="#1D4ED8" />
          <ellipse cx="80" cy="120" rx="52" ry="21" fill="#3B82F6" />

          {/* Hueco central del rollo (núcleo de cartón) */}
          <ellipse cx="80" cy="120" rx="30" ry="12" fill="#FAEDCD" />
          <path
            d="M 50,120 
               C 50,132 110,132 110,120 
               L 110,145 
               C 110,157 50,157 50,145 
               Z"
            fill="url(#cardboardCore)"
          />
          <ellipse cx="80" cy="120" rx="27" ry="10.5" fill="#0F172A" />

          {/* Lengüeta de cinta desenrollada lista para aplicar con corte recto */}
          <path
            d="M 138,150 
               L 155,160 
               L 155,195 
               L 138,175 
               Z"
            fill="#60A5FA"
            opacity="0.95"
          />

          {/* Texto en el núcleo de la cinta */}
        </svg>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 4. ESPÁTULA DE ACERO INOXIDABLE FLEXIBLE PARA RESANAR PAREDES 4"
  // (Hoja trapezoidal pulida espejo, remaches de bronce, mango ergonómico)
  // -------------------------------------------------------------------------
  if (resolvedType === 'espatula') {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg 
          viewBox="0 0 160 250" 
          className="w-full h-full drop-shadow-xl filter"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Hoja de acero inoxidable pulido espejo con bisel afilado */}
            <linearGradient id="bladeSteel" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="25%" stopColor="#E2E8F0" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="75%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            {/* Mango ergonómico bi-material azul/negro */}
            <linearGradient id="spatulaHandle" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0B1E48" />
              <stop offset="40%" stopColor="#1E3A8A" />
              <stop offset="70%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#0B1E48" />
            </linearGradient>

            {/* Remaches de bronce */}
            <radialGradient id="brassRivet" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="60%" stopColor="#CA8A04" />
              <stop offset="100%" stopColor="#713F12" />
            </radialGradient>
          </defs>

          {/* Sombra base */}
          <ellipse cx="80" cy="236" rx="46" ry="7" fill="#0F172A" opacity="0.22" filter="blur(3px)" />

          {/* 1. HOJA TRAPEZOIDAL DE ACERO FLEXIBLE (ARRIBA) */}
          <path
            d="M 30,30 
               L 130,30 
               L 105,130 
               L 55,130 
               Z"
            fill="url(#bladeSteel)"
          />

          {/* Bisel afilado en el filo superior de 4 pulgadas */}
          <polygon points="30,30 130,30 128,34 32,34" fill="#FFFFFF" opacity="0.9" />
          <line x1="30" y1="30" x2="130" y2="30" stroke="#94A3B8" strokeWidth="1" />

          {/* Grabado en la hoja de acero: FLEX 4" */}
          <text x="80" y="68" fill="#475569" fontSize="6" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.8" opacity="0.8">
            COLORLINK
          </text>

          {/* 2. MANGO BI-MATERIAL ERGONÓMICO */}
          {/* Cabo con forma anatómica */}
          <path
            d="M 60,122 
               C 60,118 100,118 100,122 
               L 95,215 
               C 95,225 65,225 65,215 
               Z"
            fill="url(#spatulaHandle)"
          />

          {/* Remaches de fijación pasantes de latón */}
          <circle cx="80" cy="140" r="3.5" fill="url(#brassRivet)" />
          <circle cx="80" cy="160" r="3.5" fill="url(#brassRivet)" />

          {/* Agujero para colgar en el extremo */}
          <circle cx="80" cy="208" r="4" fill="#0F172A" />
        </svg>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 5. EXTENSIÓN TELESCÓPICA EN ALUMINIO 2 METROS
  // (Punta roscada universal, tramos de aluminio anodizado, collarín de bloqueo)
  // -------------------------------------------------------------------------
  if (resolvedType === 'extension') {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg 
          viewBox="0 0 160 250" 
          className="w-full h-full drop-shadow-xl filter"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Aluminio estriado pulido */}
            <linearGradient id="aluminumShaft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="25%" stopColor="#E2E8F0" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="75%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>

            {/* Mecanismo de rosca / twist lock de goma naranja y negro */}
            <linearGradient id="twistLockGrip" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C2410C" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#9A3412" />
            </linearGradient>

            {/* Empuñadura inferior antideslizante */}
            <linearGradient id="extensionHandle" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0B1E48" />
              <stop offset="50%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
          </defs>

          {/* Sombra base */}
          <ellipse cx="80" cy="238" rx="22" ry="5" fill="#0F172A" opacity="0.22" filter="blur(2px)" />

          {/* 1. PUNTA ROSCADA UNIVERSAL PARA RODILLOS (ARRIBA) */}
          {/* Espiga roscada estándar */}
          <rect x="74" y="16" width="12" height="18" rx="2" fill="#F97316" stroke="#C2410C" strokeWidth="1" />
          {/* Estrías de la rosca universal */}
          <line x1="74" y1="20" x2="86" y2="20" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="74" y1="25" x2="86" y2="25" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="74" y1="30" x2="86" y2="30" stroke="#FFFFFF" strokeWidth="1.5" />

          {/* Cuello reforzado del conector */}
          <rect x="71" y="34" width="18" height="10" rx="3" fill="#1E293B" />

          {/* 2. TRAMO SUPERIOR TELESCÓPICO (Más delgado, 12mm de ancho) */}
          <rect x="74" y="44" width="12" height="70" fill="url(#aluminumShaft)" stroke="#94A3B8" strokeWidth="0.5" />

          {/* 3. COLLARÍN DE BLOQUEO GIRATORIO TWIST-LOCK (Centro) */}
          <rect x="68" y="112" width="24" height="24" rx="4" fill="url(#twistLockGrip)" />
          {/* Estrías antideslizantes del collarín */}
          <g stroke="#7C2D12" strokeWidth="1.5">
            <line x1="72" y1="116" x2="72" y2="132" />
            <line x1="76" y1="116" x2="76" y2="132" />
            <line x1="80" y1="116" x2="80" y2="132" />
            <line x1="84" y1="116" x2="84" y2="132" />
            <line x1="88" y1="116" x2="88" y2="132" />
          </g>

          {/* 4. TRAMO INFERIOR PRINCIPAL (Más robusto, 18mm de ancho) */}
          <rect x="71" y="136" width="18" height="66" fill="url(#aluminumShaft)" stroke="#94A3B8" strokeWidth="0.5" />

          {/* Medidor / Marca en el tubo de aluminio */}

          {/* 5. EMPUÑADURA INFERIOR ANATÓMICA CON GRIP */}
          <rect x="68" y="200" width="24" height="34" rx="5" fill="url(#extensionHandle)" />
          {/* Anillos de agarre ergonómico */}
          <g stroke="#334155" strokeWidth="1">
            <line x1="68" y1="207" x2="92" y2="207" />
            <line x1="68" y1="214" x2="92" y2="214" />
            <line x1="68" y1="221" x2="92" y2="221" />
          </g>

          {/* Orificio pasante para colgar en taller */}
          <circle cx="80" cy="227" r="3.5" fill="#F8FAFC" />
        </svg>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 6. BANDEJA PLÁSTICA REFORZADA PARA PINTURA 9"
  // (Rampa acanalada escurridora, pico vertedor y patas antideslizantes)
  // -------------------------------------------------------------------------
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg 
        viewBox="0 0 160 250" 
        className="w-full h-full drop-shadow-xl filter"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="trayPlastic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="50%" stopColor="#0B1E48" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>

        <ellipse cx="80" cy="225" rx="58" ry="14" fill="#0F172A" opacity="0.25" filter="blur(4px)" />

        {/* Bandeja en perspectiva isométrica */}
        <polygon points="25,70 135,70 148,195 12,195" fill="url(#trayPlastic)" rx="8" />
        <polygon points="32,76 128,76 140,188 20,188" fill="#1E293B" />

        {/* Rampa acanalada escurridora estriada */}
        <g stroke="#334155" strokeWidth="2.5" opacity="0.75">
          <line x1="40" y1="95" x2="120" y2="95" />
          <line x1="38" y1="110" x2="122" y2="110" />
          <line x1="35" y1="125" x2="125" y2="125" />
          <line x1="32" y1="140" x2="128" y2="140" />
        </g>

        {/* Pozo / depósito inferior de pintura */}
        <polygon points="24,155 136,155 140,188 20,188" fill="#0F172A" />
      </svg>
    </div>
  );
};
