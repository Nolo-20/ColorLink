import React from 'react';

interface PaintCanGraphicProps {
  colorHex?: string;
  colorName?: string;
  brandName?: string;
  productLine?: string;
  sizeName?: string;
  className?: string;
  subtitle?: string;
  productCode?: string;
  isDetailed?: boolean;
  category?: string;
}

export const PaintCanGraphic: React.FC<PaintCanGraphicProps> = ({
  colorHex = '#FAF9F6',
  colorName = 'Blanco Puro',
  brandName = 'ColorLink',
  productLine = 'Viniltex Ultralavable',
  sizeName = '1 Galón',
  className = 'w-36 h-44',
  subtitle = 'Pintura Arquitectónica',
  productCode = 'CL-1001',
  isDetailed = false,
  category
}) => {
  const isAutomotive = 
    category === 'automotriz' ||
    productLine.toLowerCase().includes('poliuretano') || 
    productLine.toLowerCase().includes('auto') || 
    subtitle.toLowerCase().includes('automotriz') ||
    sizeName.toLowerCase().includes('catalizador') || 
    sizeName.toLowerCase().includes('endurecedor') ||
    sizeName.toLowerCase().includes('kit con');

  const isAerosol = 
    sizeName.toLowerCase().includes('aerosol') || 
    sizeName.toLowerCase().includes('spray');

  const isCunete = sizeName.toLowerCase().includes('5 gal') || 
                   sizeName.toLowerCase().includes('cuñete') || 
                   sizeName.toLowerCase().includes('cunete') ||
                   sizeName.toLowerCase().includes('caneca');

  const isCuarto = sizeName.toLowerCase().includes('1/4') || 
                   sizeName.toLowerCase().includes('cuarto');

  const isMedioCunete = sizeName.toLowerCase().includes('2.5');

  // --- RENDER AUTOMOTIVE AEROSOL (400 ml Express Touch-up with Pro Fan Valve) ---
  if (isAutomotive && isAerosol) {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg 
          viewBox="0 0 160 250" 
          className="w-full h-full drop-shadow-2xl filter"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="sprayFloorShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#020617" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#0F172A" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="aerosolCanBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#09090B" />
              <stop offset="15%" stopColor="#27272A" />
              <stop offset="35%" stopColor="#52525B" />
              <stop offset="50%" stopColor="#71717A" />
              <stop offset="70%" stopColor="#3F3F46" />
              <stop offset="85%" stopColor="#18181B" />
              <stop offset="100%" stopColor="#09090B" />
            </linearGradient>
            <linearGradient id="sprayChrome" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="25%" stopColor="#CBD5E1" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="75%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>

          {/* Floor Shadow */}
          <ellipse cx="80" cy="235" rx="55" ry="8" fill="url(#sprayFloorShadow)" />

          {/* Aerosol Body */}
          <path d="M 44 80 L 44 220 C 44 228, 116 228, 116 220 L 116 80 Z" fill="url(#aerosolCanBody)" />

          {/* Color Banner Band */}
          <path d="M 44 135 L 44 200 C 65 204, 95 204, 116 200 L 116 135 Z" fill={colorHex} />
          <path d="M 44 135 L 44 200 C 65 204, 95 204, 116 200 L 116 135 Z" fill="#000000" opacity="0.25" />

          {/* Tapered Shoulder Dome */}
          <path d="M 44 80 C 44 58, 116 58, 116 80 Z" fill="url(#sprayChrome)" />
          <ellipse cx="80" cy="80" rx="36" ry="6" fill="#18181B" />

          {/* Chime Rings */}
          <ellipse cx="80" cy="62" rx="20" ry="4" fill="url(#sprayChrome)" />
          <rect x="74" y="44" width="12" height="18" rx="2" fill="#E2E8F0" />

          {/* Red Professional Actuator Spray Nozzle */}
          <path d="M 72 34 L 88 34 L 88 44 L 72 44 Z" fill="#DC2626" />
          <circle cx="80" cy="38" r="2.5" fill="#18181B" />
          <rect x="79" y="37" width="2" height="2" fill="#F8FAFC" />

          {/* Brand & Text */}
          <text x="80" y="102" fill="#FFFFFF" fontSize="9" fontWeight="950" letterSpacing="0.8" textAnchor="middle" fontFamily="sans-serif">
            COLORLINK AUTO
          </text>
          <text x="80" y="114" fill="#38BDF8" fontSize="7" fontWeight="900" letterSpacing="0.5" textAnchor="middle" fontFamily="sans-serif">
            AEROSOL 2K PRO
          </text>
          <text x="80" y="125" fill="#E2E8F0" fontSize="5.5" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
            VÁLVULA ABANICO • 400 ML
          </text>

          {/* Tone Name in color swatch */}
          <g transform="translate(48, 155)">
            <rect x="0" y="0" width="64" height="22" rx="5" fill="#09090B" opacity="0.85" />
            <circle cx="10" cy="11" r="5" fill={colorHex} stroke="#FFFFFF" strokeWidth="1" />
            <text x="20" y="13" fill="#FFFFFF" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">
              {colorName.length > 9 ? colorName.slice(0, 9) + '..' : colorName}
            </text>
          </g>

          {/* Bottom Chime */}
          <ellipse cx="80" cy="220" rx="36" ry="5.5" fill="url(#sprayChrome)" />
        </svg>
      </div>
    );
  }

  // --- RENDER AUTOMOTIVE 2K SYSTEM (Image 3 Match: Poliuretano Can + Endurecedor Hardener Can) ---
  if (isAutomotive) {
    const isBigKit = sizeName.toLowerCase().includes('galón') || sizeName.toLowerCase().includes('galon');
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg 
          viewBox="0 0 280 240" 
          className="w-full h-full drop-shadow-2xl filter"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Grounding Floor Shadow for Both Cans */}
            <radialGradient id="autoDualFloorShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#020617" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#0F172A" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            {/* High-Gloss Automotive Metallic Black Finish for Poliuretano Can */}
            <linearGradient id="autoBodyGloss" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#09090B" />
              <stop offset="12%" stopColor="#18181B" />
              <stop offset="28%" stopColor="#27272A" />
              <stop offset="42%" stopColor="#3F3F46" />
              <stop offset="50%" stopColor="#52525B" />
              <stop offset="58%" stopColor="#3F3F46" />
              <stop offset="75%" stopColor="#18181B" />
              <stop offset="100%" stopColor="#09090B" />
            </linearGradient>

            {/* Chrome Mirror Chimes */}
            <linearGradient id="autoChrome" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="20%" stopColor="#94A3B8" />
              <stop offset="45%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#E2E8F0" />
              <stop offset="85%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>

            {/* Hardener Can Brushed Tin Finish */}
            <linearGradient id="hardenerBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="20%" stopColor="#475569" />
              <stop offset="45%" stopColor="#CBD5E1" />
              <stop offset="55%" stopColor="#F1F5F9" />
              <stop offset="75%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            {/* Glossy Hood Reflection Highlight */}
            <linearGradient id="hoodGlossHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Unified Ground Floor Shadow */}
          <ellipse cx="140" cy="222" rx="120" ry="14" fill="url(#autoDualFloorShadow)" />

          {/* ======================================================== */}
          {/* 1. LEFT/MAIN CAN: POLIURETANO 2K (Exact Image 3 Styling) */}
          {/* ======================================================== */}
          <g id="main-poliuretano-can">
            {/* Can Body (x: 25 to 175, w: 150, h: 155) */}
            <path 
              d="M 25 58 L 25 204 C 25 216, 175 216, 175 204 L 175 58 Z" 
              fill="url(#autoBodyGloss)" 
            />

            {/* Automotive Sports Car Hood / Curved Silhouette Graphic (Image 3 Art) */}
            {/* Dynamic Swatch Layer: renders vibrant vehicle hood sweep in selected color */}
            <path 
              d="M 25 125 C 55 110, 110 105, 175 130 L 175 200 C 130 212, 60 212, 25 200 Z" 
              fill={colorHex} 
            />
            {/* Dynamic Aerodynamic Hood Reflections & Light Lines */}
            <path 
              d="M 25 125 C 55 110, 110 105, 175 130 L 175 170 C 120 145, 60 150, 25 160 Z" 
              fill="url(#hoodGlossHighlight)" 
            />

            {/* Car Hood Stylized Aerodynamic Ridges */}
            <path 
              d="M 40 135 C 75 125, 125 125, 160 142" 
              fill="none" 
              stroke="#FFFFFF" 
              strokeWidth="1.5" 
              opacity="0.6" 
            />
            <path 
              d="M 50 148 C 80 140, 120 140, 150 154" 
              fill="none" 
              stroke="#FFFFFF" 
              strokeWidth="1" 
              opacity="0.4" 
            />

            {/* --- LABEL GRAPHICS (Matching Image 3 Pintuco / ColorLink Poliuretano) --- */}
            {/* ColorLink Automotive Badge (Image 3: Oval Brand Badge) */}
            <g transform="translate(100, 78)">
              <ellipse cx="0" cy="0" rx="34" ry="14" fill="#0B1A3A" stroke="#38BDF8" strokeWidth="1.2" />
              <text 
                x="0" 
                y="4" 
                fill="#FFFFFF" 
                fontSize="9.5" 
                fontWeight="950" 
                letterSpacing="0.8" 
                textAnchor="middle" 
                fontFamily="sans-serif"
              >
                COLORLINK
              </text>
            </g>

            {/* Big Bold "POLIURETANO" (Image 3 Typography) */}
            <text 
              x="100" 
              y="104" 
              fill="#FFFFFF" 
              fontSize="14.5" 
              fontWeight="950" 
              letterSpacing="0.6" 
              textAnchor="middle" 
              fontFamily="sans-serif"
            >
              POLIURETANO
            </text>

            {/* Italic Subtitle: "Brillo y color que perdura" (Exact phrase from Image 3!) */}
            <text 
              x="100" 
              y="114" 
              fill="#FDE047" 
              fontSize="6.5" 
              fontStyle="italic" 
              fontWeight="700" 
              textAnchor="middle" 
              fontFamily="serif, sans-serif"
            >
              Brillo y color que perdura
            </text>

            {/* Line Type Tag (Image 3: Single Stage / Serie 600) */}
            <text 
              x="100" 
              y="123" 
              fill="#94A3B8" 
              fontSize="5.5" 
              fontWeight="800" 
              letterSpacing="0.4" 
              textAnchor="middle" 
              fontFamily="sans-serif"
            >
              SINGLE STAGE • SERIE 600 • 2K
            </text>

            {/* Color Swatch & Specification Tag */}
            <g transform="translate(38, 166)">
              <rect x="0" y="0" width="124" height="26" rx="6" fill="#09090B" opacity="0.88" />
              <rect x="1" y="1" width="122" height="24" rx="5" stroke="#FFFFFF" strokeWidth="0.8" fill="none" opacity="0.3" />
              <circle cx="14" cy="13" r="6" fill={colorHex} stroke="#FFFFFF" strokeWidth="1.2" />
              <text 
                x="26" 
                y="12" 
                fill="#FFFFFF" 
                fontSize="8" 
                fontWeight="900" 
                fontFamily="sans-serif"
              >
                {colorName.length > 15 ? colorName.slice(0, 15) + '...' : colorName}
              </text>
              <text 
                x="26" 
                y="20" 
                fill="#38BDF8" 
                fontSize="6.2" 
                fontWeight="800" 
                fontFamily="sans-serif"
              >
                {sizeName} • Dureza OEM 2K
              </text>
            </g>

            {/* Bottom Chrome Chime */}
            <path 
              d="M 25 200 C 25 212, 175 212, 175 200 L 175 206 C 175 218, 25 218, 25 206 Z" 
              fill="url(#autoChrome)" 
            />

            {/* Top Metallic Chime Rim & Friction Lid */}
            <ellipse cx="100" cy="58" rx="75" ry="12.5" fill="url(#autoChrome)" />
            <ellipse cx="100" cy="58" rx="70" ry="11" fill="#27272A" />
            <ellipse cx="100" cy="57" rx="66" ry="10" fill="url(#autoChrome)" />
            <ellipse cx="100" cy="56" rx="58" ry="8" fill="#52525B" />
            <ellipse cx="100" cy="55.5" rx="44" ry="6" fill="url(#autoChrome)" />
          </g>

          {/* ======================================================== */}
          {/* 2. RIGHT/COMPANION CAN: ENDURECEDOR (Image 3 Hardener Can) */}
          {/* ======================================================== */}
          <g id="companion-endurecedor-can" transform="translate(180, 20)">
            {/* Slender Metal Can Body (w: 66, h: 125, y: 65 to 190) */}
            <path 
              d="M 6 65 L 6 182 C 6 190, 72 190, 72 182 L 72 65 Z" 
              fill="url(#hardenerBody)" 
            />

            {/* Metallic Threaded Pouring Cap (Image 3 screw top) */}
            <rect x="27" y="32" width="24" height="18" rx="3" fill="url(#autoChrome)" />
            {/* Ridges on Cap */}
            <line x1="31" y1="34" x2="31" y2="48" stroke="#334155" strokeWidth="1" />
            <line x1="35" y1="34" x2="35" y2="48" stroke="#334155" strokeWidth="1" />
            <line x1="39" y1="34" x2="39" y2="48" stroke="#334155" strokeWidth="1" />
            <line x1="43" y1="34" x2="43" y2="48" stroke="#334155" strokeWidth="1" />
            <line x1="47" y1="34" x2="47" y2="48" stroke="#334155" strokeWidth="1" />

            {/* Tapered Chime Neck below Cap */}
            <path d="M 22 56 L 27 50 L 51 50 L 56 56 Z" fill="url(#autoChrome)" />
            <ellipse cx="39" cy="65" rx="33" ry="6.5" fill="url(#autoChrome)" />

            {/* Red Accent Header Band (Image 3 Hardener Styling) */}
            <path 
              d="M 6 80 L 6 112 C 22 116, 56 116, 72 112 L 72 80 C 56 78, 22 78, 6 80 Z" 
              fill="#DC2626" 
            />

            {/* "ENDURECEDOR" Title on Can (Exact word from Image 3!) */}
            <text 
              x="39" 
              y="95" 
              fill="#FFFFFF" 
              fontSize="7" 
              fontWeight="950" 
              letterSpacing="0.4" 
              textAnchor="middle" 
              fontFamily="sans-serif"
            >
              ENDURECEDOR
            </text>
            <text 
              x="39" 
              y="104" 
              fill="#FEF08A" 
              fontSize="5.2" 
              fontWeight="900" 
              textAnchor="middle" 
              fontFamily="sans-serif"
            >
              HARDENER 2K
            </text>

            {/* Component B Designation */}
            <g transform="translate(10, 118)">
              <rect x="0" y="0" width="58" height="15" rx="3" fill="#09090B" opacity="0.7" />
              <text 
                x="29" 
                y="10.5" 
                fill="#38BDF8" 
                fontSize="6" 
                fontWeight="900" 
                textAnchor="middle" 
                fontFamily="sans-serif"
              >
                COMPONENTE B
              </text>
            </g>

            {/* Volume on Hardener */}
            <text 
              x="39" 
              y="146" 
              fill="#FFFFFF" 
              fontSize="6" 
              fontWeight="800" 
              textAnchor="middle" 
              fontFamily="sans-serif"
            >
              {isBigKit ? '1 LITRO' : '250 ML'}
            </text>
            <text 
              x="39" 
              y="154" 
              fill="#CBD5E1" 
              fontSize="4.8" 
              fontWeight="600" 
              textAnchor="middle" 
              fontFamily="sans-serif"
            >
              ISOCIANATO ALIFÁTICO
            </text>

            {/* Bottom Chime on Hardener */}
            <path 
              d="M 6 180 C 6 186, 72 186, 72 180 L 72 184 C 72 190, 6 190, 6 184 Z" 
              fill="url(#autoChrome)" 
            />
          </g>

          {/* Top Badge: "KIT BICOMPONENTE 2K (A + B)" */}
          <g transform="translate(15, 20)">
            <rect x="0" y="0" width="138" height="18" rx="4" fill="#09090B" opacity="0.9" stroke="#38BDF8" strokeWidth="0.8" />
            <text 
              x="69" 
              y="12" 
              fill="#38BDF8" 
              fontSize="6.8" 
              fontWeight="950" 
              letterSpacing="0.4" 
              textAnchor="middle" 
              fontFamily="sans-serif"
            >
              KIT 2K: PINTURA + ENDURECEDOR
            </text>
          </g>
        </svg>
      </div>
    );
  }

  // --- RENDER 5 GALONES CUÑETE (Image 4 Style: White Tapered Plastic Bucket, Big Blue Lid, Ribs & Metal Handle) ---
  if (isCunete || isMedioCunete) {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg 
          viewBox="0 0 240 280" 
          className="w-full h-full drop-shadow-2xl filter"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Floor Drop Shadow */}
            <radialGradient id="bucketFloorShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#020617" stopOpacity="0.6" />
              <stop offset="55%" stopColor="#0F172A" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            {/* Blue Lid Plastic Gradient */}
            <linearGradient id="blueLidGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0A2558" />
              <stop offset="15%" stopColor="#134199" />
              <stop offset="45%" stopColor="#2563EB" />
              <stop offset="55%" stopColor="#3B82F6" />
              <stop offset="75%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#0A2558" />
            </linearGradient>

            {/* Bucket Plastic White Tapered Body 3D Lighting */}
            <linearGradient id="whiteBucketSheen" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.8" />
              <stop offset="12%" stopColor="#CBD5E1" stopOpacity="0.4" />
              <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#E2E8F0" stopOpacity="0.2" />
              <stop offset="90%" stopColor="#94A3B8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#64748B" stopOpacity="0.9" />
            </linearGradient>

            {/* Metal Handle Gradient */}
            <linearGradient id="metalBail" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="30%" stopColor="#E2E8F0" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="80%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            {/* Swatch Sheen */}
            <linearGradient id="bucketSwatchSheen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Floor Shadow */}
          <ellipse cx="120" cy="265" rx="85" ry="12" fill="url(#bucketFloorShadow)" />

          {/* --- METAL WIRE BAIL HANDLE (Curved Behind/Around Bucket) --- */}
          <path 
            d="M 24 95 C 24 15, 216 15, 216 95" 
            fill="none" 
            stroke="url(#metalBail)" 
            strokeWidth="4" 
            strokeLinecap="round" 
          />
          {/* Plastic Center Grip on Wire Handle */}
          <path 
            d="M 100 24 C 112 23, 128 23, 140 24" 
            fill="none" 
            stroke="#F8FAFC" 
            strokeWidth="8" 
            strokeLinecap="round" 
          />
          <path 
            d="M 102 24 C 112 23, 128 23, 138 24" 
            fill="none" 
            stroke="#CBD5E1" 
            strokeWidth="2" 
            strokeLinecap="round" 
          />

          {/* --- TAPERED BUCKET PLASTIC BODY (White base) --- */}
          {/* Top width: ~180 (x from 30 to 210), Bottom width: ~156 (x from 42 to 198) */}
          <path 
            d="M 30 65 L 42 245 C 42 258, 198 258, 198 245 L 210 65 Z" 
            fill="#F1F5F9" 
            stroke="#CBD5E1" 
            strokeWidth="1.5" 
          />

          {/* Bottom Rim Ellipse */}
          <ellipse cx="120" cy="245" rx="78" ry="11" fill="#E2E8F0" />
          <ellipse cx="120" cy="247" rx="76" ry="9" fill="#CBD5E1" />

          {/* --- VINILTEX / KORAZA LARGE LABEL (Matching Image 4) --- */}
          {/* Lower Label Body - Dynamically reflects selected color */}
          <path 
            d="M 34 110 L 40 236 C 70 246, 170 246, 200 236 L 206 110 C 170 118, 70 118, 34 110 Z" 
            fill={colorHex} 
          />
          {/* Subtle contrast gradient over colored body */}
          <path 
            d="M 34 110 L 40 236 C 70 246, 170 246, 200 236 L 206 110 C 170 118, 70 118, 34 110 Z" 
            fill="#020617" 
            opacity="0.25"
          />

          {/* Upper Navy Wave on Label (Image 4: Navy upper section with ColorLink ribbon) */}
          <path 
            d="M 34 110 L 36 160 C 90 182, 160 152, 206 162 L 206 110 C 170 118, 70 118, 34 110 Z" 
            fill="#0B1A3A" 
          />

          {/* Brand Logo in Upper Navy Wave */}
          <g transform="translate(120, 126)">
            {/* Color ribbon swirl icon */}
            <path 
              d="M -35 -4 C -20 -12, 5 2, 25 -8 C 15 5, -10 -2, -35 -4 Z" 
              fill="#F97316" 
            />
            <path 
              d="M -25 -2 C -10 -8, 10 4, 32 -4" 
              fill="none" 
              stroke="#10B981" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
            />
            <text 
              x="0" 
              y="16" 
              fill="#FFFFFF" 
              fontSize="16" 
              fontWeight="900" 
              letterSpacing="0.8"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              COLORLINK
            </text>
          </g>

          {/* Big Product Name (e.g. VINILTEX / KORAZA) */}
          <text 
            x="120" 
            y="180" 
            fill="#FFFFFF" 
            fontSize="17" 
            fontWeight="950" 
            letterSpacing="0.5"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {productLine.toUpperCase().slice(0, 14)}
          </text>

          {/* Subtitle / Type */}
          <text 
            x="120" 
            y="193" 
            fill="#FEF08A" 
            fontSize="8.5" 
            fontWeight="800" 
            letterSpacing="0.4"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            CUÑETE 5 GALONES • ULTRA PROTECT
          </text>

          {/* Clean Color Badge inside Label - No overflowing text, NO hex code */}
          <g transform="translate(46, 200)">
            <rect x="0" y="0" width="148" height="26" rx="13" fill="#020617" opacity="0.65" />
            <rect x="1.5" y="1.5" width="145" height="23" rx="11.5" stroke="#FFFFFF" strokeWidth="1" fill="none" opacity="0.4" />
            <circle cx="16" cy="13" r="7" fill={colorHex} stroke="#FFFFFF" strokeWidth="1.5" />
            <text 
              x="30" 
              y="16.5" 
              fill="#FFFFFF" 
              fontSize="9" 
              fontWeight="900" 
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {colorName.length > 17 ? colorName.slice(0, 17) + '...' : colorName}
            </text>
          </g>

          {/* 3D Specular Shading Over Tapered Body */}
          <path 
            d="M 30 65 L 42 245 C 42 258, 198 258, 198 245 L 210 65 Z" 
            fill="url(#whiteBucketSheen)" 
            pointerEvents="none" 
          />

          {/* --- UPPER REINFORCING RIBS / COLLAR (Image 4: 3 horizontal strengthening ridges) --- */}
          {/* Rib 1 (Lowest) */}
          <path 
            d="M 31 100 C 60 107, 180 107, 209 100 L 208 96 C 180 103, 60 103, 32 96 Z" 
            fill="#CBD5E1" 
          />
          {/* Rib 2 (Middle) */}
          <path 
            d="M 30 86 C 60 93, 180 93, 210 86 L 209 82 C 180 89, 60 89, 31 82 Z" 
            fill="#CBD5E1" 
          />
          {/* Rib 3 (Top collar under lid) */}
          <path 
            d="M 29 72 C 60 79, 180 79, 211 72 L 210 68 C 180 75, 60 75, 30 68 Z" 
            fill="#CBD5E1" 
          />

          {/* Handle Side Ear Brackets (White Plastic Brackets holding the bail) */}
          <rect x="20" y="85" width="10" height="16" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          <circle cx="25" cy="93" r="3" fill="#334155" />
          <rect x="210" y="85" width="10" height="16" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          <circle cx="215" cy="93" r="3" fill="#334155" />

          {/* --- LARGE BLUE SNAP-ON LID (Image 4 Style: Wide Plastic Lid with Rim Lip) --- */}
          {/* Lid Overhang Lip */}
          <path 
            d="M 22 56 C 22 42, 218 42, 218 56 L 217 66 C 217 76, 23 76, 23 66 Z" 
            fill="url(#blueLidGradient)" 
          />
          {/* Top Lid Ellipse Outer */}
          <ellipse cx="120" cy="56" rx="98" ry="16" fill="url(#blueLidGradient)" />
          {/* Lid Rim Border Ring */}
          <ellipse cx="120" cy="55.5" rx="93" ry="14.5" fill="#1E40AF" />
          {/* Recessed Basin inside Lid */}
          <ellipse cx="120" cy="54" rx="88" ry="13" fill="#1D4ED8" />
          {/* Center Reinforcement Ring on Lid */}
          <ellipse cx="120" cy="53" rx="66" ry="9.5" fill="#2563EB" />
          <ellipse cx="120" cy="52.5" rx="58" ry="7.5" fill="#1E3A8A" />

          {/* Size Badge Overlay (5 Galones / 18.9L) */}
          <g transform="translate(168, 48)">
            <rect x="0" y="0" width="46" height="16" rx="4" fill="#F59E0B" />
            <text 
              x="23" 
              y="11.5" 
              fill="#0F172A" 
              fontSize="7.5" 
              fontWeight="900" 
              textAnchor="middle"
              fontFamily="monospace"
            >
              5 GALONES
            </text>
          </g>
        </svg>
      </div>
    );
  }

  // --- RENDER 1/4 GALÓN (Compact Tin Container with Friction Plug Lid) ---
  if (isCuarto) {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg 
          viewBox="0 0 200 240" 
          className="w-full h-full drop-shadow-xl filter"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="quartMetal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="15%" stopColor="#94A3B8" />
              <stop offset="35%" stopColor="#E2E8F0" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#CBD5E1" />
              <stop offset="90%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            <linearGradient id="quartCan3D" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0B1528" stopOpacity="0.8" />
              <stop offset="15%" stopColor="#1E293B" stopOpacity="0.3" />
              <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <stop offset="88%" stopColor="#0F172A" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.85" />
            </linearGradient>

            <radialGradient id="quartShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#020617" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#0F172A" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Floor Shadow */}
          <ellipse cx="100" cy="222" rx="66" ry="8" fill="url(#quartShadow)" />

          {/* Compact Tin Cylinder with Dynamic Color Tint */}
          <path 
            d="M 44 68 L 44 205 C 44 216, 156 216, 156 205 L 156 68 Z" 
            fill="#1E293B" 
          />
          {/* Dynamic Color Accent Band */}
          <path 
            d="M 44 110 L 44 195 C 80 200, 120 200, 156 195 L 156 110 C 120 114, 80 114, 44 110 Z" 
            fill={colorHex} 
          />
          <path 
            d="M 44 110 L 44 195 C 80 200, 120 200, 156 195 L 156 110 C 120 114, 80 114, 44 110 Z" 
            fill="#020617" 
            opacity="0.35"
          />

          {/* Deep Navy Upper Header on Label */}
          <path 
            d="M 44 74 L 44 110 C 80 114, 120 114, 156 110 L 156 74 Z" 
            fill="#0B1A3A" 
          />

          {/* Brand & Product */}
          <text 
            x="100" 
            y="93" 
            fill="#FFFFFF" 
            fontSize="10" 
            fontWeight="900" 
            letterSpacing="0.8"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            COLORLINK PRO
          </text>
          <text 
            x="100" 
            y="104" 
            fill="#34D399" 
            fontSize="6.5" 
            fontWeight="800" 
            textAnchor="middle"
            fontFamily="monospace"
          >
            1/4 GALÓN (0.95L)
          </text>

          {/* Swatch in Quart Can - Clean, centered, NO hex code */}
          <g transform="translate(50, 134)">
            <rect x="0" y="0" width="100" height="34" rx="7" fill="#020617" opacity="0.7" />
            <rect x="1" y="1" width="98" height="32" rx="6" stroke="#FFFFFF" strokeWidth="1" fill="none" opacity="0.3" />
            <circle cx="16" cy="17" r="7" fill={colorHex} stroke="#FFFFFF" strokeWidth="1.5" />
            <text 
              x="30" 
              y="16" 
              fill="#FFFFFF" 
              fontSize="8" 
              fontWeight="900" 
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {colorName.length > 12 ? colorName.slice(0, 12) + '...' : colorName}
            </text>
            <text 
              x="30" 
              y="24" 
              fill="#FDE047" 
              fontSize="6.5" 
              fontWeight="800" 
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              Tono Seleccionado
            </text>
          </g>

          {/* 3D Cylindrical Sheen */}
          <path 
            d="M 44 68 L 44 205 C 44 216, 156 216, 156 205 L 156 68 Z" 
            fill="url(#quartCan3D)" 
            pointerEvents="none" 
          />

          {/* Bottom Chime Metallic Rim */}
          <path 
            d="M 44 202 C 44 212, 156 212, 156 202 L 156 207 C 156 217, 44 217, 44 207 Z" 
            fill="url(#quartMetal)" 
          />

          {/* Top Rim & Friction Plug Lid */}
          <ellipse cx="100" cy="68" rx="56" ry="11" fill="url(#quartMetal)" />
          <ellipse cx="100" cy="67.5" rx="51" ry="9.5" fill="#475569" />
          <ellipse cx="100" cy="66" rx="46" ry="8" fill="url(#quartMetal)" />
          <ellipse cx="100" cy="65" rx="40" ry="6.5" fill="#F1F5F9" />
          <ellipse cx="100" cy="64.5" rx="30" ry="4.5" fill="url(#quartMetal)" />
        </svg>
      </div>
    );
  }

  // --- RENDER 1 GALÓN (Classic Metallic Paint Can Matching Image 3: Koraza / Viniltex Style) ---
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg 
        viewBox="0 0 200 240" 
        className="w-full h-full drop-shadow-2xl filter"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Metallic Rim Gradients (Image 3 metal sheen) */}
          <linearGradient id="metalBevel1G" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="10%" stopColor="#94A3B8" />
            <stop offset="28%" stopColor="#CBD5E1" />
            <stop offset="42%" stopColor="#F8FAFC" />
            <stop offset="55%" stopColor="#FFFFFF" />
            <stop offset="72%" stopColor="#CBD5E1" />
            <stop offset="88%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Cylindrical 3D Lighting for Metal Can */}
          <linearGradient id="canBody3D1G" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0B1528" stopOpacity="0.88" />
            <stop offset="14%" stopColor="#1E293B" stopOpacity="0.32" />
            <stop offset="38%" stopColor="#FFFFFF" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="62%" stopColor="#FFFFFF" stopOpacity="0.15" />
            <stop offset="85%" stopColor="#0F172A" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.92" />
          </linearGradient>

          {/* Floor Shadow */}
          <radialGradient id="canFloorShadow1G" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#020617" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#0F172A" stopOpacity="0.25" />
            <stop offset="85%" stopColor="#1E293B" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Gold Shield Gradient (Matching Koraza shield in Image 3) */}
          <linearGradient id="goldShield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="35%" stopColor="#EAB308" />
            <stop offset="70%" stopColor="#CA8A04" />
            <stop offset="100%" stopColor="#A16207" />
          </linearGradient>

          {/* Swatch Sheen */}
          <linearGradient id="swatchSheen1G" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Floor Shadow */}
        <ellipse cx="100" cy="226" rx="76" ry="10" fill="url(#canFloorShadow1G)" />

        {/* Wire Bail Handle Behind Can */}
        <path 
          d="M 28 85 C 28 15, 172 15, 172 85" 
          fill="none" 
          stroke="url(#metalBevel1G)" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
        />
        {/* Wire Handle Plastic Grip */}
        <path 
          d="M 85 24 C 95 23, 105 23, 115 24" 
          fill="none" 
          stroke="#1E293B" 
          strokeWidth="6" 
          strokeLinecap="round" 
        />

        {/* --- CAN CYLINDRICAL BODY --- */}
        {/* Base Cylinder Outer (Deep Navy / Royal Blue like Image 3) */}
        <path 
          d="M 32 50 L 32 208 C 32 220, 168 220, 168 208 L 168 50 Z" 
          fill="#0B1A3A" 
        />
        {/* Dynamic Color Accent Band reflecting the chosen paint color */}
        <path 
          d="M 32 140 L 32 205 C 32 218, 168 218, 168 205 L 168 140 C 130 148, 70 148, 32 140 Z" 
          fill={colorHex} 
        />
        <path 
          d="M 32 140 L 32 205 C 32 218, 168 218, 168 205 L 168 140 C 130 148, 70 148, 32 140 Z" 
          fill="#020617" 
          opacity="0.3"
        />

        {/* --- LABEL GRAPHICS (Matching Image 3 Pintuco / Koraza Style) --- */}
        {/* Dynamic Colorful Wave Ribbon at Top (Red, Yellow, Blue, Green swirl) */}
        <path 
          d="M 60 62 C 80 50, 110 70, 140 56 C 130 68, 90 62, 60 62 Z" 
          fill="#EF4444" 
        />
        <path 
          d="M 70 64 C 90 54, 120 72, 148 60" 
          fill="none" 
          stroke="#10B981" 
          strokeWidth="2" 
          strokeLinecap="round" 
        />

        {/* Bold Brand Name: COLORLINK (Like Pintuco in Image 3) */}
        <text 
          x="100" 
          y="84" 
          fill="#FFFFFF" 
          fontSize="16" 
          fontWeight="950" 
          letterSpacing="0.5"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          COLORLINK
        </text>

        {/* Product Emblem / Gold Shield (Like Koraza shield in Image 3) */}
        <g transform="translate(62, 92)">
          {/* Outer Shield with Gold Gradient */}
          <path 
            d="M 0 4 C 20 2, 56 2, 76 4 C 76 26, 48 42, 38 48 C 28 42, 0 26, 0 4 Z" 
            fill="url(#goldShield)" 
            stroke="#FEF08A" 
            strokeWidth="1.5" 
          />
          {/* Inner Navy Shield Fill */}
          <path 
            d="M 3 6 C 22 5, 54 5, 73 6 C 73 24, 46 38, 38 44 C 30 38, 3 24, 3 6 Z" 
            fill="#0F172A" 
          />
          {/* Shield Title (e.g. Koraza / Viniltex) */}
          <text 
            x="38" 
            y="20" 
            fill="#FFFFFF" 
            fontSize="9" 
            fontWeight="950" 
            letterSpacing="0.4"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {productLine.split(' ')[0].toUpperCase()}
          </text>
          <text 
            x="38" 
            y="28" 
            fill="#FACC15" 
            fontSize="5.5" 
            fontWeight="800" 
            letterSpacing="0.3"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            SOL & LLUVIA PRO
          </text>

          {/* Split Sun / Rain circular graphic inside shield (Image 3) */}
          <circle cx="28" cy="36" r="5" fill="#F59E0B" />
          <circle cx="48" cy="36" r="5" fill="#3B82F6" />
        </g>

        {/* Selected Dynamic Color Swatch Ribbon - Clean, centered, NO hex code */}
        <g transform="translate(36, 148)">
          <rect x="0" y="0" width="128" height="34" rx="8" fill="#020617" opacity="0.75" />
          <rect 
            x="1" 
            y="1" 
            width="126" 
            height="32" 
            rx="7" 
            stroke="#FFFFFF" 
            strokeWidth="1" 
            fill="none"
            opacity="0.4"
          />
          <circle cx="17" cy="17" r="7.5" fill={colorHex} stroke="#FFFFFF" strokeWidth="1.5" />
          <text 
            x="32" 
            y="16" 
            fill="#FFFFFF" 
            fontSize="8.5" 
            fontWeight="900" 
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {colorName.length > 15 ? colorName.slice(0, 15) + '...' : colorName}
          </text>
          <text 
            x="32" 
            y="24" 
            fill="#FDE047" 
            fontSize="7" 
            fontWeight="800" 
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {sizeName} • Protección Total
          </text>
        </g>

        {/* Dot Matrix Gradient Pattern Near Bottom (Image 3 Feature) */}
        <g opacity="0.3" fill="#FFFFFF">
          <circle cx="48" cy="204" r="0.8" />
          <circle cx="56" cy="204" r="0.8" />
          <circle cx="64" cy="204" r="1.2" />
          <circle cx="72" cy="204" r="1.2" />
          <circle cx="80" cy="204" r="1.5" />
          <circle cx="88" cy="204" r="1.5" />
          <circle cx="96" cy="204" r="1.8" />
          <circle cx="104" cy="204" r="1.8" />
          <circle cx="112" cy="204" r="1.5" />
          <circle cx="120" cy="204" r="1.5" />
          <circle cx="128" cy="204" r="1.2" />
          <circle cx="136" cy="204" r="1.2" />
          <circle cx="144" cy="204" r="0.8" />
          <circle cx="152" cy="204" r="0.8" />
        </g>

        {/* 3D Specular Sheen Overlay */}
        <path 
          d="M 32 50 L 32 208 C 32 220, 168 220, 168 208 L 168 50 Z" 
          fill="url(#canBody3D1G)" 
          pointerEvents="none" 
        />

        {/* Bottom Metallic Rim */}
        <path 
          d="M 32 204 C 32 216, 168 216, 168 204 L 168 210 C 168 222, 32 222, 32 210 Z" 
          fill="url(#metalBevel1G)" 
        />

        {/* Top Metallic Rim & Recessed Can Lid (Image 3 Detail) */}
        <ellipse cx="100" cy="50" rx="68" ry="13" fill="url(#metalBevel1G)" />
        <ellipse cx="100" cy="50" rx="63" ry="11.5" fill="#475569" />
        <ellipse cx="100" cy="49.5" rx="60" ry="10.5" fill="url(#metalBevel1G)" />
        <ellipse cx="100" cy="48" rx="55" ry="9" fill="#E2E8F0" />
        <ellipse cx="100" cy="47.5" rx="44" ry="7" fill="url(#metalBevel1G)" />
        <ellipse cx="100" cy="47" rx="38" ry="5.5" fill="#F8FAFC" />

        {/* Handle Fasteners */}
        <circle cx="28" cy="85" r="5" fill="url(#metalBevel1G)" />
        <circle cx="28" cy="85" r="2" fill="#334155" />
        <circle cx="172" cy="85" r="5" fill="url(#metalBevel1G)" />
        <circle cx="172" cy="85" r="2" fill="#334155" />
      </svg>
    </div>
  );
};
