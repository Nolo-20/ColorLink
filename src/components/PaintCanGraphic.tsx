import React, { useId, useState } from 'react';

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

// ---------------------------------------------------------------------------
// Utilidades de color y texto
// ---------------------------------------------------------------------------

const clampHex = (hex: string) => {
  const c = (hex || '#FFFFFF').replace('#', '');
  const full = c.length === 3 ? c.split('').map(ch => ch + ch).join('') : c.padEnd(6, 'F').slice(0, 6);
  return `#${full}`;
};

const luminance = (hex: string) => {
  const c = clampHex(hex).slice(1);
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
};

const shade = (hex: string, amount: number) => {
  // amount -1..1: negativo oscurece, positivo aclara
  const c = clampHex(hex).slice(1);
  const ch = [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16));
  const out = ch.map(v => Math.round(amount < 0 ? v * (1 + amount) : v + (255 - v) * amount));
  return `#${out.map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')}`;
};

/**
 * Texto que nunca se sale de su ancho: si el tamaño estimado excede maxWidth,
 * se comprime con textLength (sin cortar letras).
 */
const FitText: React.FC<{
  x: number; y: number; maxWidth: number; size: number; children: string;
  fill: string; weight?: number; spacing?: number; opacity?: number; italic?: boolean;
}> = ({ x, y, maxWidth, size, children, fill, weight = 800, spacing = 0, opacity = 1, italic }) => {
  const text = children || '';
  const estimated = text.length * size * (weight >= 800 ? 0.62 : 0.56) + Math.max(0, text.length - 1) * spacing;
  const tooWide = estimated > maxWidth;
  return (
    <text
      x={x}
      y={y}
      fill={fill}
      fontSize={size}
      fontWeight={weight}
      letterSpacing={tooWide ? 0 : spacing}
      opacity={opacity}
      textAnchor="middle"
      fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
      fontStyle={italic ? 'italic' : undefined}
      {...(tooWide ? { textLength: maxWidth, lengthAdjust: 'spacingAndGlyphs' } : {})}
    >
      {text}
    </text>
  );
};

// Separa "Koraza Protección Sol & Lluvia" en { main: 'KORAZA', sub: 'Protección Sol & Lluvia' }
const splitLine = (productLine: string, subtitle: string) => {
  const words = (productLine || 'ColorLink').trim().split(/\s+/);
  const main = words[0];
  const rest = words.slice(1).join(' ');
  return { main: main.toUpperCase(), sub: rest || subtitle };
};

const shortSize = (sizeName: string) => {
  const s = sizeName.toLowerCase();
  if (s.includes('aerosol') || s.includes('spray')) return '400 ml';
  if (s.includes('1/4') || s.includes('cuarto')) return '1/4 GAL · 0.95 L';
  if (s.includes('2.5')) return '2.5 GAL · 9.46 L';
  if (s.includes('5 gal') || s.includes('cuñete') || s.includes('cunete') || s.includes('caneca')) return '5 GAL · 18.9 L';
  if (s.includes('gal')) return '1 GAL · 3.78 L';
  return sizeName.toUpperCase();
};


// ---------------------------------------------------------------------------
// Fotos reales de producto (public/products/<linea>-<presentacion>.webp)
// ---------------------------------------------------------------------------
const PHOTO_LINES: Array<[RegExp, string]> = [
  [/viniltex/i, 'viniltex'],
  [/koraza/i, 'koraza'],
  [/pintulux/i, 'pintulux'],
  [/fill/i, 'pintucofill'],
  [/ep[oó]xico/i, 'epoxico'],
  [/poliuretano/i, 'poliuretano']
];
const PHOTO_SIZES: Record<string, string[]> = {
  viniltex: ['cuarto', 'galon', 'medio', 'cunete'],
  koraza: ['cuarto', 'galon', 'cunete'],
  pintulux: ['cuarto', 'galon', 'cunete'],
  pintucofill: ['cuarto', 'galon', 'cunete'],
  epoxico: ['cuarto', 'galon', 'cunete'],
  poliuretano: ['octavo', 'cuarto', 'galon', 'aerosol']
};

export function productPhoto(productLine: string, sizeName: string): string | null {
  const line = PHOTO_LINES.find(([re]) => re.test(productLine))?.[1];
  if (!line) return null;
  const s = (sizeName || '').toLowerCase();
  let size = 'galon';
  if (/aerosol|spray/.test(s)) size = 'aerosol';
  else if (s.includes('1/8')) size = 'octavo';
  else if (s.includes('1/4') || s.includes('cuarto')) size = 'cuarto';
  else if (s.includes('2.5')) size = 'medio';
  else if (/5 gal|cuñete|cunete|caneca|industrial/.test(s)) size = 'cunete';
  const available = PHOTO_SIZES[line];
  if (!available.includes(size)) size = available.includes('galon') ? 'galon' : available[0];
  return `/products/${line}-${size}`;
}

const FONT = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const NAVY = '#0B1E48';

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export const PaintCanGraphic: React.FC<PaintCanGraphicProps> = ({
  colorHex = '#FAF9F6',
  colorName = 'Blanco Puro',
  brandName = 'ColorLink',
  productLine = 'Viniltex Ultralavable',
  sizeName = '1 Galón',
  className = 'w-36 h-44',
  subtitle = 'Pintura Arquitectónica',
  category
}) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  // Si la foto no carga, se dibuja la lata vectorial (nunca una imagen rota)
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const candidate = productPhoto(productLine, sizeName);
  const photo = candidate && candidate !== failedPhoto ? candidate : null;
  if (photo) {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <div className="relative h-full max-w-full aspect-square bg-white rounded-2xl overflow-hidden">
          <img
            src={`${photo}.webp`}
            srcSet={`${photo}-sm.webp 320w, ${photo}.webp 900w`}
            sizes="(min-width: 1024px) 420px, 240px"
            alt={`${productLine} ${sizeName}`}
            loading="lazy"
            draggable={false}
            onError={() => setFailedPhoto(photo)}
            className="w-full h-full object-contain"
          />
          {/* Color elegido */}
          <span
            className="absolute bottom-[5%] right-[5%] w-[16%] min-w-2.5 max-w-8 aspect-square rounded-full ring-2 ring-white shadow-md"
            style={{ backgroundColor: colorHex }}
            title={colorName}
          />
        </div>
      </div>
    );
  }
  const id = (name: string) => `${name}-${uid}`;
  const url = (name: string) => `url(#${id(name)})`;

  const color = clampHex(colorHex);
  const isLightPaint = luminance(color) > 165;
  const onColor = isLightPaint ? '#0F172A' : '#FFFFFF';
  const onColorSoft = isLightPaint ? 'rgba(15,23,42,0.65)' : 'rgba(255,255,255,0.8)';

  const lower = `${productLine} ${subtitle} ${sizeName}`.toLowerCase();
  const isAutomotive = category === 'automotriz' || /poliuretano|automotriz|catalizador|endurecedor|kit con|\bauto\b/.test(lower);
  const isAerosol = /aerosol|spray/.test(sizeName.toLowerCase());
  const s = sizeName.toLowerCase();
  const isCuarto = s.includes('1/4') || s.includes('cuarto');
  const isMedio = s.includes('2.5');
  const isCunete = !isMedio && (s.includes('5 gal') || s.includes('cuñete') || s.includes('cunete') || s.includes('caneca'));

  const { main, sub } = splitLine(productLine, subtitle);
  const sizeText = shortSize(sizeName);
  const brand = (brandName || 'ColorLink').split(' ')[0].toUpperCase();

  // Definiciones comunes: metal, plástico, sombreado cilíndrico y sombra de piso
  const commonDefs = (
    <>
      <linearGradient id={id('metal')} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#5B6573" />
        <stop offset="0.12" stopColor="#AEB6C2" />
        <stop offset="0.32" stopColor="#F4F6F9" />
        <stop offset="0.48" stopColor="#C9CFD8" />
        <stop offset="0.75" stopColor="#8A93A1" />
        <stop offset="1" stopColor="#4A5260" />
      </linearGradient>
      <linearGradient id={id('metalTop')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F8FAFC" />
        <stop offset="0.5" stopColor="#CBD2DC" />
        <stop offset="1" stopColor="#8D96A5" />
      </linearGradient>
      <linearGradient id={id('cyl')} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity="0.42" />
        <stop offset="0.14" stopColor="#000" stopOpacity="0.12" />
        <stop offset="0.3" stopColor="#FFF" stopOpacity="0.22" />
        <stop offset="0.38" stopColor="#FFF" stopOpacity="0.05" />
        <stop offset="0.7" stopColor="#000" stopOpacity="0.08" />
        <stop offset="1" stopColor="#000" stopOpacity="0.5" />
      </linearGradient>
      <linearGradient id={id('labelNavy')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#13306E" />
        <stop offset="1" stopColor={NAVY} />
      </linearGradient>
      <linearGradient id={id('paint')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={shade(color, 0.08)} />
        <stop offset="1" stopColor={shade(color, -0.12)} />
      </linearGradient>
      <radialGradient id={id('floor')} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#0F172A" stopOpacity="0.38" />
        <stop offset="0.7" stopColor="#0F172A" stopOpacity="0.1" />
        <stop offset="1" stopColor="#0F172A" stopOpacity="0" />
      </radialGradient>
    </>
  );

  // Franja de color con nombre del tono (como el color impreso en la lata real)
  const ColorBand = ({ cx, y, w, h, arc, nameSize, sizeSize }: { cx: number; y: number; w: number; h: number; arc: number; nameSize: number; sizeSize: number }) => {
    const x0 = cx - w / 2;
    const x1 = cx + w / 2;
    return (
      <g>
        <path d={`M ${x0} ${y} Q ${cx} ${y + arc * 2} ${x1} ${y} L ${x1} ${y + h} Q ${cx} ${y + h + arc * 2} ${x0} ${y + h} Z`} fill={url('paint')} />
        {isLightPaint && (
          <path d={`M ${x0} ${y} Q ${cx} ${y + arc * 2} ${x1} ${y}`} fill="none" stroke="#0F172A" strokeOpacity="0.12" strokeWidth="0.8" />
        )}
        <FitText x={cx} y={y + h * 0.48 + arc} maxWidth={w * 0.8} size={nameSize} fill={onColor} weight={800}>
          {colorName}
        </FitText>
        <FitText x={cx} y={y + h * 0.8 + arc} maxWidth={w * 0.7} size={sizeSize} fill={onColorSoft} weight={700} spacing={0.6}>
          {sizeText}
        </FitText>
      </g>
    );
  };

  const Wrapper: React.FC<{ viewBox: string; children: React.ReactNode }> = ({ viewBox, children }) => (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg viewBox={viewBox} className="w-full h-full" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`${productLine} ${colorName} ${sizeName}`}>
        <defs>{commonDefs}</defs>
        {children}
      </svg>
    </div>
  );

  // -------------------------------------------------------------------------
  // AEROSOL AUTOMOTRIZ
  // -------------------------------------------------------------------------
  if (isAerosol) {
    const cx = 100, x0 = 70, x1 = 130, top = 74, bottom = 216;
    return (
      <Wrapper viewBox="0 0 200 240">
        <ellipse cx={cx} cy={bottom + 9} rx="46" ry="7" fill={url('floor')} />
        {/* Tapa del color de la pintura */}
        <path d={`M 76 40 L 124 40 L 126 64 Q 100 70 74 64 Z`} fill={url('paint')} />
        <path d={`M 76 40 L 124 40 L 126 64 Q 100 70 74 64 Z`} fill={url('cyl')} />
        <ellipse cx={cx} cy="40" rx="24" ry="4" fill={shade(color, 0.25)} />
        {/* Hombro */}
        <path d={`M ${x0} ${top} Q ${x0} 60 ${cx} 58 Q ${x1} 60 ${x1} ${top} Z`} fill={url('metal')} />
        {/* Cuerpo */}
        <path d={`M ${x0} ${top} L ${x0} ${bottom} Q ${cx} ${bottom + 8} ${x1} ${bottom} L ${x1} ${top} Q ${cx} ${top + 6} ${x0} ${top} Z`} fill="#111827" />
        <FitText x={cx} y={98} maxWidth={52} size={8} fill="#FFFFFF" weight={900} spacing={1.2}>{brand}</FitText>
        <FitText x={cx} y={114} maxWidth={52} size={11} fill="#FFFFFF" weight={900}>{main}</FitText>
        <FitText x={cx} y={125} maxWidth={52} size={6} fill="#7DD3FC" weight={700}>AEROSOL 2K</FitText>
        <ColorBand cx={cx} y={150} w={x1 - x0} h={44} arc={3} nameSize={7.5} sizeSize={5.5} />
        <path d={`M ${x0} ${top} L ${x0} ${bottom} Q ${cx} ${bottom + 8} ${x1} ${bottom} L ${x1} ${top} Q ${cx} ${top + 6} ${x0} ${top} Z`} fill={url('cyl')} />
        <path d={`M ${x0} ${bottom - 4} Q ${cx} ${bottom + 4} ${x1} ${bottom - 4} L ${x1} ${bottom} Q ${cx} ${bottom + 8} ${x0} ${bottom} Z`} fill={url('metal')} />
      </Wrapper>
    );
  }

  // -------------------------------------------------------------------------
  // KIT AUTOMOTRIZ 2K: lata de poliuretano + endurecedor
  // -------------------------------------------------------------------------
  if (isAutomotive) {
    const cx = 92, x0 = 38, x1 = 146, top = 70, bottom = 206, ry = 9;
    const bx0 = 158, bx1 = 196, bcx = 177;
    return (
      <Wrapper viewBox="0 0 220 240">
        <ellipse cx="112" cy={bottom + 12} rx="92" ry="8" fill={url('floor')} />
        {/* Lata principal */}
        <path d={`M ${x0} ${top} L ${x0} ${bottom} A ${(x1 - x0) / 2} ${ry} 0 0 0 ${x1} ${bottom} L ${x1} ${top} Z`} fill="#0F172A" />
        <FitText x={cx} y={top + 30} maxWidth={88} size={10} fill="#FFFFFF" weight={900} spacing={2}>{brand}</FitText>
        <FitText x={cx} y={top + 52} maxWidth={92} size={19} fill="#FFFFFF" weight={900}>{main}</FitText>
        <FitText x={cx} y={top + 66} maxWidth={88} size={7} fill="#7DD3FC" weight={700} spacing={0.5}>{sub.toUpperCase()}</FitText>
        <ColorBand cx={cx} y={top + 84} w={x1 - x0} h={40} arc={ry * 0.5} nameSize={10} sizeSize={6.5} />
        <path d={`M ${x0} ${top} L ${x0} ${bottom} A ${(x1 - x0) / 2} ${ry} 0 0 0 ${x1} ${bottom} L ${x1} ${top} Z`} fill={url('cyl')} />
        <path d={`M ${x0} ${bottom - 6} A ${(x1 - x0) / 2} ${ry} 0 0 0 ${x1} ${bottom - 6} L ${x1} ${bottom} A ${(x1 - x0) / 2} ${ry} 0 0 1 ${x0} ${bottom} Z`} fill={url('metal')} />
        <ellipse cx={cx} cy={top} rx={(x1 - x0) / 2} ry={ry} fill={url('metal')} />
        <ellipse cx={cx} cy={top} rx={(x1 - x0) / 2 - 7} ry={ry - 2.5} fill={url('metalTop')} />
        <ellipse cx={cx} cy={top} rx={(x1 - x0) / 2 - 18} ry={ry - 4.5} fill="none" stroke="#7B8494" strokeWidth="1.2" />

        {/* Endurecedor */}
        <path d={`M ${bx0} 120 L ${bx0} ${bottom} Q ${bcx} ${bottom + 6} ${bx1} ${bottom} L ${bx1} 120 Q ${bcx} 112 ${bx0} 120 Z`} fill={url('metal')} />
        <path d={`M ${bx0 + 6} 120 Q ${bcx} 100 ${bx1 - 6} 120 Z`} fill={url('metal')} />
        <rect x={bcx - 6} y="92" width="12" height="14" rx="2" fill="#475569" />
        <rect x={bcx - 7} y="88" width="14" height="6" rx="1.5" fill="#1F2937" />
        <rect x={bx0} y="142" width={bx1 - bx0} height="40" fill="#B91C1C" />
        <FitText x={bcx} y={158} maxWidth={32} size={6} fill="#FFFFFF" weight={900}>ENDURECEDOR</FitText>
        <FitText x={bcx} y={170} maxWidth={30} size={5} fill="#FECACA" weight={700}>COMP. B · 2K</FitText>
        <path d={`M ${bx0} 120 L ${bx0} ${bottom} Q ${bcx} ${bottom + 6} ${bx1} ${bottom} L ${bx1} 120 Q ${bcx} 112 ${bx0} 120 Z`} fill={url('cyl')} />
      </Wrapper>
    );
  }

  // -------------------------------------------------------------------------
  // CUÑETE (5 gal) y BALDE (2.5 gal): balde plástico cónico con tapa y asa
  // -------------------------------------------------------------------------
  if (isCunete || isMedio) {
    const cx = 100;
    const topY = isMedio ? 74 : 58, botY = 214;
    const tw = isMedio ? 128 : 146, bw = isMedio ? 110 : 124; // ancho arriba / abajo
    const tx0 = cx - tw / 2, tx1 = cx + tw / 2, bx0 = cx - bw / 2, bx1 = cx + bw / 2;
    const lerpX = (t: number, side: 0 | 1) => side === 0 ? tx0 + (bx0 - tx0) * t : tx1 + (bx1 - tx1) * t;
    const yAt = (t: number) => topY + (botY - topY) * t;
    const lt = 0.2, lb = 0.94; // etiqueta
    const ly0 = yAt(lt), ly1 = yAt(lb);
    const lx0a = lerpX(lt, 0), lx1a = lerpX(lt, 1), lx0b = lerpX(lb, 0), lx1b = lerpX(lb, 1);
    const ry = 11;
    const labelW = lx1a - lx0a;
    const bandT0 = 0.66, bandT1 = 0.9;
    return (
      <Wrapper viewBox="0 0 200 240">
        <defs>
          <linearGradient id={id('plastic')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#C7CDD6" />
            <stop offset="0.3" stopColor="#FFFFFF" />
            <stop offset="0.7" stopColor="#E5E9EF" />
            <stop offset="1" stopColor="#AEB6C2" />
          </linearGradient>
          <linearGradient id={id('lid')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2B4FA8" />
            <stop offset="1" stopColor="#13306E" />
          </linearGradient>
        </defs>
        <ellipse cx={cx} cy={botY + 10} rx={bw / 2 + 14} ry="8" fill={url('floor')} />
        {/* Cuerpo */}
        <path d={`M ${tx0} ${topY} L ${bx0} ${botY} Q ${cx} ${botY + ry * 1.4} ${bx1} ${botY} L ${tx1} ${topY} Z`} fill={url('plastic')} />
        {/* Etiqueta impresa */}
        <path d={`M ${lx0a} ${ly0} Q ${cx} ${ly0 + ry * 1.6} ${lx1a} ${ly0} L ${lx1b} ${ly1} Q ${cx} ${ly1 + ry * 1.4} ${lx0b} ${ly1} Z`} fill={url('labelNavy')} />
        <FitText x={cx} y={yAt(0.36) + 6} maxWidth={labelW * 0.72} size={12} fill="#FFFFFF" weight={900} spacing={2.5}>{brand}</FitText>
        <FitText x={cx} y={yAt(0.48) + 7} maxWidth={labelW * 0.8} size={22} fill="#FFFFFF" weight={900}>{main}</FitText>
        <FitText x={cx} y={yAt(0.56) + 7} maxWidth={labelW * 0.76} size={8} fill="#93C5FD" weight={700} spacing={0.4}>{sub}</FitText>
        {(() => {
          const y0 = yAt(bandT0) + 4, y1 = yAt(bandT1) + 4;
          const a0 = lerpX(bandT0, 0), a1 = lerpX(bandT0, 1), b0 = lerpX(bandT1, 0), b1 = lerpX(bandT1, 1);
          return (
            <g>
              <path d={`M ${a0} ${y0} Q ${cx} ${y0 + ry * 1.5} ${a1} ${y0} L ${b1} ${y1} Q ${cx} ${y1 + ry * 1.4} ${b0} ${y1} Z`} fill={url('paint')} />
              <FitText x={cx} y={(y0 + y1) / 2 + 6} maxWidth={(a1 - a0) * 0.78} size={12} fill={onColor} weight={800}>{colorName}</FitText>
              <FitText x={cx} y={(y0 + y1) / 2 + 17} maxWidth={(a1 - a0) * 0.6} size={7} fill={onColorSoft} weight={700} spacing={0.6}>{sizeText}</FitText>
            </g>
          );
        })()}
        <path d={`M ${tx0} ${topY} L ${bx0} ${botY} Q ${cx} ${botY + ry * 1.4} ${bx1} ${botY} L ${tx1} ${topY} Z`} fill={url('cyl')} />
        {/* Aros de refuerzo */}
        {[0.08, 0.14].map(t => (
          <path key={t} d={`M ${lerpX(t, 0)} ${yAt(t)} Q ${cx} ${yAt(t) + ry * 1.6} ${lerpX(t, 1)} ${yAt(t)}`} fill="none" stroke="#94A3B8" strokeOpacity="0.6" strokeWidth="1.4" />
        ))}
        {/* Tapa */}
        <ellipse cx={cx} cy={topY} rx={tw / 2 + 3} ry={ry + 1} fill={url('lid')} />
        <path d={`M ${tx0 - 3} ${topY} L ${tx0 - 3} ${topY + 7} Q ${cx} ${topY + ry * 2.2} ${tx1 + 3} ${topY + 7} L ${tx1 + 3} ${topY} Q ${cx} ${topY + ry * 2} ${tx0 - 3} ${topY} Z`} fill="#0F2557" />
        <ellipse cx={cx} cy={topY - 1} rx={tw / 2 - 8} ry={ry - 3} fill="#1E3F8F" />
        <ellipse cx={cx} cy={topY - 1} rx={tw / 2 - 20} ry={ry - 5} fill="none" stroke="#3B63C4" strokeWidth="1.2" />
        {/* Asa */}
        <circle cx={tx0 + 2} cy={topY + 16} r="3.2" fill="#64748B" />
        <circle cx={tx1 - 2} cy={topY + 16} r="3.2" fill="#64748B" />
        <path d={`M ${tx0 + 2} ${topY + 16} Q ${cx} ${topY - 34} ${tx1 - 2} ${topY + 16}`} fill="none" stroke="#475569" strokeWidth="2.4" strokeLinecap="round" />
        <rect x={cx - 16} y={topY - 15} width="32" height="7" rx="3.5" fill="#1F2937" />
      </Wrapper>
    );
  }

  // -------------------------------------------------------------------------
  // LATA METÁLICA: galón (con asa) o cuarto de galón (más baja)
  // -------------------------------------------------------------------------
  const cx = 100;
  const w = isCuarto ? 112 : 136;
  const x0 = cx - w / 2, x1 = cx + w / 2;
  const top = isCuarto ? 96 : 56;
  const bottom = 212;
  const ry = isCuarto ? 9 : 10.5;
  const r = w / 2;
  const h = bottom - top;
  const labelTop = top + h * 0.14;
  const labelBottom = bottom - h * 0.08;
  const bandTop = top + h * (isCuarto ? 0.66 : 0.62);
  const bandH = labelBottom - bandTop - 2;
  const body = `M ${x0} ${top} L ${x0} ${bottom} A ${r} ${ry} 0 0 0 ${x1} ${bottom} L ${x1} ${top} Z`;
  const ring = (y: number) => `M ${x0} ${y} A ${r} ${ry} 0 0 0 ${x1} ${y}`;

  return (
    <Wrapper viewBox="0 0 200 240">
      <ellipse cx={cx} cy={bottom + 12} rx={r + 16} ry="8" fill={url('floor')} />
      {/* Cuerpo metálico */}
      <path d={body} fill={url('metal')} />
      {/* Etiqueta */}
      <path d={`M ${x0} ${labelTop} A ${r} ${ry} 0 0 0 ${x1} ${labelTop} L ${x1} ${labelBottom} A ${r} ${ry} 0 0 1 ${x0} ${labelBottom} Z`} fill={url('labelNavy')} />
      {/* Arco de marca */}
      <path d={`M ${x0 + w * 0.2} ${labelTop + h * (isCuarto ? 0.09 : 0.12)} Q ${cx} ${labelTop + h * (isCuarto ? 0.01 : 0.02)} ${x1 - w * 0.2} ${labelTop + h * (isCuarto ? 0.09 : 0.12)}`} fill="none" stroke={color} strokeWidth={isCuarto ? 2.2 : 2.8} strokeLinecap="round" opacity={isLightPaint ? 0.9 : 1} />
      <FitText x={cx} y={labelTop + h * (isCuarto ? 0.2 : 0.2)} maxWidth={w * 0.66} size={isCuarto ? 8.5 : 11} fill="#FFFFFF" weight={900} spacing={isCuarto ? 1.6 : 2.4}>{brand}</FitText>
      <FitText x={cx} y={labelTop + h * (isCuarto ? 0.35 : 0.34)} maxWidth={w * 0.78} size={isCuarto ? 15 : 21} fill="#FFFFFF" weight={900}>{main}</FitText>
      <FitText x={cx} y={labelTop + h * (isCuarto ? 0.44 : 0.42)} maxWidth={w * 0.74} size={isCuarto ? 6.5 : 8} fill="#93C5FD" weight={700} spacing={0.3}>{sub}</FitText>
      <ColorBand cx={cx} y={bandTop} w={w} h={bandH} arc={ry * 0.5} nameSize={isCuarto ? 9 : 11} sizeSize={isCuarto ? 6 : 7} />
      {/* Sombreado cilíndrico sobre todo el cuerpo */}
      <path d={body} fill={url('cyl')} />
      {/* Aros del cuerpo */}
      <path d={ring(labelTop - 3)} fill="none" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="1" />
      <path d={`M ${x0} ${bottom - 7} A ${r} ${ry} 0 0 0 ${x1} ${bottom - 7} L ${x1} ${bottom} A ${r} ${ry} 0 0 1 ${x0} ${bottom} Z`} fill={url('metal')} />
      <path d={ring(bottom - 7)} fill="none" stroke="#000" strokeOpacity="0.18" strokeWidth="1" />
      {/* Tapa */}
      <ellipse cx={cx} cy={top} rx={r} ry={ry} fill={url('metal')} />
      <ellipse cx={cx} cy={top} rx={r - 6} ry={ry - 2.2} fill={url('metalTop')} />
      <ellipse cx={cx} cy={top + 0.5} rx={r - 14} ry={ry - 4} fill="none" stroke="#7B8494" strokeWidth="1.2" />
      <ellipse cx={cx} cy={top + 0.5} rx={r - 26} ry={ry - 6} fill="none" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1" />
      {/* Asa del galón */}
      {!isCuarto && (
        <g>
          <rect x={x0 - 3} y={top + 8} width="7" height="12" rx="2" fill="#64748B" />
          <rect x={x1 - 4} y={top + 8} width="7" height="12" rx="2" fill="#64748B" />
          <path d={`M ${x0} ${top + 14} Q ${x0 - 4} ${top - 40} ${cx} ${top - 42} Q ${x1 + 4} ${top - 40} ${x1} ${top + 14}`} fill="none" stroke="#9AA3B0" strokeWidth="2.2" />
          <rect x={cx - 18} y={top - 47} width="36" height="9" rx="4.5" fill="#1F2937" />
        </g>
      )}
    </Wrapper>
  );
};
